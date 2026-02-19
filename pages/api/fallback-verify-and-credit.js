// pages/api/fallback-verify-and-credit.js
import axios from "axios";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Rate limiting simple store (in production, use Redis or similar)
const rateLimit = new Map();

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_ATTEMPTS = 3;

function checkRateLimit(reference) {
  const now = Date.now();
  const attempts = rateLimit.get(reference) || [];
  
  // Clean old attempts
  const recentAttempts = attempts.filter(time => now - time < RATE_LIMIT_WINDOW);
  
  if (recentAttempts.length >= MAX_ATTEMPTS) {
    return false;
  }
  
  recentAttempts.push(now);
  rateLimit.set(reference, recentAttempts);
  return true;
}

export default async function handler(req, res) {
  // Only allow POST/GET for this endpoint
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ 
      error: "Method not allowed",
      message: "Only GET and POST requests are allowed" 
    });
  }

  const { reference } = req.query;
  
  if (!reference) {
    return res.status(400).json({ 
      error: "Missing reference",
      message: "Payment reference is required" 
    });
  }

  // Validate reference format (Paystack references are usually alphanumeric)
  if (!/^[a-zA-Z0-9_-]+$/.test(reference)) {
    return res.status(400).json({ 
      error: "Invalid reference format",
      message: "Reference contains invalid characters" 
    });
  }

  // Admin guard: require secret header
  const providedSecret = req.headers["x-fallback-secret"];
  const expectedSecret = process.env.FALLBACK_SECRET;
  
  if (!expectedSecret) {
    console.error("FALLBACK_SECRET not configured in environment");
    return res.status(500).json({ 
      error: "Server configuration error",
      message: "Fallback secret not configured" 
    });
  }

  if (!providedSecret || providedSecret !== expectedSecret) {
    console.warn("Invalid fallback secret attempt:", {
      provided: providedSecret ? "provided" : "missing",
      reference
    });
    return res.status(403).json({ 
      error: "Forbidden",
      message: "Invalid or missing fallback secret" 
    });
  }

  // Rate limiting
  if (!checkRateLimit(reference)) {
    return res.status(429).json({
      error: "Too many requests",
      message: `Too many verification attempts. Please wait ${RATE_LIMIT_WINDOW/1000} seconds.`
    });
  }

  const startTime = Date.now();
  const requestId = `${reference}-${startTime}`;

  try {
    console.log(`[${requestId}] Fallback verify started for reference:`, reference);

    // First, check if transaction already exists in database
    const { data: existingTransaction, error: checkError } = await supabaseAdmin
      .from("transactions")
      .select("id, status, amount, user_id, created_at")
      .eq("reference", reference)
      .maybeSingle();

    if (checkError) {
      console.error(`[${requestId}] Error checking existing transaction:`, checkError);
      // Continue anyway, don't block the flow
    }

    if (existingTransaction) {
      console.log(`[${requestId}] Transaction already exists:`, {
        status: existingTransaction.status,
        amount: existingTransaction.amount
      });

      // If it's already success, return early
      if (existingTransaction.status === "success") {
        return res.status(200).json({ 
          status: "already_recorded",
          message: "Transaction was already processed successfully",
          data: {
            amount: existingTransaction.amount,
            user_id: existingTransaction.user_id,
            reference
          }
        });
      }
    }

    // 1. Verify with Paystack
    let paystackRes;
    try {
      paystackRes = await axios.get(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          },
          timeout: 10000, // 10 second timeout
        }
      );
    } catch (paystackError) {
      console.error(`[${requestId}] Paystack API error:`, {
        message: paystackError.message,
        response: paystackError.response?.data,
        status: paystackError.response?.status
      });

      if (paystackError.response?.status === 404) {
        return res.status(404).json({ 
          error: "Reference not found",
          message: "Transaction reference not found on Paystack" 
        });
      }

      if (paystackError.code === 'ECONNABORTED') {
        return res.status(504).json({ 
          error: "Timeout",
          message: "Paystack verification timed out. Please try again." 
        });
      }

      return res.status(502).json({ 
        error: "Paystack error",
        message: "Failed to verify with Paystack",
        details: paystackError.message 
      });
    }

    console.log(`[${requestId}] Paystack verify response received`);
    const trx = paystackRes.data.data;

    if (!trx) {
      return res.status(400).json({ 
        error: "Invalid response",
        message: "No transaction data received from Paystack" 
      });
    }

    if (trx.status !== "success") {
      console.warn(`[${requestId}] Transaction not successful:`, {
        status: trx.status,
        gateway_response: trx.gateway_response
      });

      return res.status(400).json({ 
        status: "failed",
        message: `Transaction is ${trx.status}`,
        gateway_response: trx.gateway_response,
        reference
      });
    }

    const amount = trx.amount / 100; // Convert from kobo
    const userId = trx.metadata?.user_id;
    
    if (!userId) {
      console.error(`[${requestId}] Missing user_id in metadata:`, trx.metadata);
      
      // Try to find user by email as fallback
      if (trx.customer?.email) {
        const { data: userByEmail } = await supabaseAdmin
          .from("profile")
          .select("id")
          .eq("email", trx.customer.email)
          .maybeSingle();
          
        if (userByEmail?.id) {
          console.log(`[${requestId}] Found user by email:`, userByEmail.id);
          return res.status(400).json({ 
            error: "Metadata missing user_id",
            message: "Transaction metadata missing user_id, but user found by email. Please contact support.",
            email: trx.customer.email,
            has_user: true
          });
        }
      }
      
      return res.status(400).json({ 
        error: "Missing user_id",
        message: "Transaction metadata missing user_id. Please contact support with this reference."
      });
    }

    // 2. Idempotency check (double-check with admin client)
    const { data: existing, error: existingErr } = await supabaseAdmin
      .from("transactions")
      .select("id, status")
      .eq("reference", reference)
      .maybeSingle();

    if (existingErr) {
      console.error(`[${requestId}] Error checking existing transaction:`, existingErr);
      return res.status(500).json({ 
        error: "Database error",
        message: "Failed to check existing transaction",
        details: existingErr.message 
      });
    }

    if (existing) {
      console.log(`[${requestId}] Transaction already recorded:`, {
        id: existing.id,
        status: existing.status
      });

      if (existing.status === "success") {
        return res.status(200).json({ 
          status: "already_recorded",
          message: "Transaction already processed successfully",
          reference
        });
      } else {
        // Update existing pending/failed transaction to success
        const { error: updateError } = await supabaseAdmin
          .from("transactions")
          .update({ 
            status: "success",
            updated_at: new Date().toISOString()
          })
          .eq("reference", reference);

        if (updateError) {
          console.error(`[${requestId}] Error updating transaction:`, updateError);
        } else {
          console.log(`[${requestId}] Updated existing transaction to success`);
        }

        return res.status(200).json({ 
          status: "updated",
          message: "Transaction updated to success",
          reference
        });
      }
    }

    // 3. Ensure wallet exists (admin client)
    let wallet;
    const { data: walletRow, error: walletErr } = await supabaseAdmin
      .from("wallets")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (walletErr) {
      console.error(`[${requestId}] Wallet lookup error:`, walletErr);
      return res.status(500).json({ 
        error: "Database error",
        message: "Failed to lookup wallet",
        details: walletErr.message 
      });
    }

    if (!walletRow) {
      console.log(`[${requestId}] Creating wallet for user:`, userId);
      const { data: newWallet, error: createWalletErr } = await supabaseAdmin
        .from("wallets")
        .insert({
          user_id: userId,
          balance: 0,
        })
        .select()
        .single();

      if (createWalletErr) {
        console.error(`[${requestId}] Failed to create wallet:`, createWalletErr);
        throw createWalletErr;
      }
      
      wallet = newWallet;
    } else {
      wallet = walletRow;
    }

    // 4. Increment balance via RPC (admin client)
    const { error: rpcErr } = await supabaseAdmin.rpc("increment_balance", {
      p_user_id: userId,
      p_amount: amount,
    });

    if (rpcErr) {
      console.error(`[${requestId}] RPC increment_balance error:`, rpcErr);
      throw rpcErr;
    }

    // 5. Insert transaction (admin client)
    const transactionData = {
      user_id: userId,
      reference,
      amount,
      status: "success",
      type: "fund",
      channel: trx.channel || "unknown",
      paid_at: trx.paid_at || new Date().toISOString(),
      metadata: {
        verified_by: "fallback",
        request_id: requestId,
        processor: "fallback-verify",
        original_data: {
          ip_address: trx.ip_address,
          authorization: trx.authorization,
          plan: trx.plan,
          requested_amount: trx.requested_amount
        }
      }
    };

    const { error: insertErr } = await supabaseAdmin
      .from("transactions")
      .insert(transactionData);

    if (insertErr) {
      console.error(`[${requestId}] Insert transaction error:`, insertErr);
      
      // Attempt to rollback the balance increment if transaction insert fails
      try {
        await supabaseAdmin.rpc("decrement_balance", {
          p_user_id: userId,
          p_amount: amount,
        });
        console.log(`[${requestId}] Rolled back balance due to transaction insert failure`);
      } catch (rollbackErr) {
        console.error(`[${requestId}] Failed to rollback balance:`, rollbackErr);
      }
      
      throw insertErr;
    }

    // 6. Create notification for successful funding
    try {
      await supabaseAdmin.from("notifications").insert({
        user_id: userId,
        type: "promo",
        title: "Wallet Funded Successfully! 💰",
        message: `Your wallet has been funded with ₦${amount.toLocaleString()} via manual verification.`,
        data: {
          action: "view_wallet",
          reference,
          amount,
          method: "fallback"
        }
      });
    } catch (notifyErr) {
      console.error(`[${requestId}] Failed to create notification:`, notifyErr);
      // Don't fail the whole request for notification failure
    }

    const processingTime = Date.now() - startTime;
    console.log(`[${requestId}] Fallback credit successful in ${processingTime}ms for:`, reference);

    return res.status(200).json({ 
      status: "credited_fallback",
      message: "Payment verified and wallet credited successfully",
      data: {
        reference,
        amount,
        user_id: userId,
        processing_time_ms: processingTime
      }
    });

  } catch (err) {
    const processingTime = Date.now() - startTime;
    console.error(`[${requestId}] Fallback verify error after ${processingTime}ms:`, {
      error: err.message,
      stack: err.stack,
      response: err.response?.data
    });

    return res.status(500).json({
      error: "Fallback verification failed",
      message: "An unexpected error occurred during verification",
      request_id: requestId,
      reference
    });
  } finally {
    // Clean up rate limiting after some time
    setTimeout(() => {
      rateLimit.delete(reference);
    }, RATE_LIMIT_WINDOW * 2);
  }
}