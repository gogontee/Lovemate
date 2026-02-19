// pages/api/fund-wallet.js
import axios from "axios";

export default async function handler(req, res) {
  // Enable CORS for local development
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Log the incoming request for debugging
  console.log("💰 Fund wallet API called:", {
    method: req.method,
    body: req.body,
    timestamp: new Date().toISOString()
  });

  // Check if it's a POST request
  if (req.method !== "POST") {
    console.log("Method not allowed:", req.method);
    return res.status(405).json({ 
      error: "Method Not Allowed",
      message: "Only POST requests are allowed"
    });
  }

  // Validate required fields
  const { amount, email, user_id } = req.body;

  const missing = [];
  if (!email) missing.push("email");
  if (!user_id) missing.push("user_id");
  if (amount === undefined || amount === null || isNaN(amount)) missing.push("amount");

  if (missing.length) {
    console.log("Missing fields:", missing);
    return res.status(400).json({ 
      error: `Missing or invalid fields: ${missing.join(", ")}`,
      received: { amount, email, user_id }
    });
  }

  // Validate amount
  const numAmount = Number(amount);
  if (numAmount < 1000) {
    return res.status(400).json({ 
      error: "Invalid amount",
      message: "Minimum amount is ₦1,000" 
    });
  }

  // Check Paystack secret key
  if (!process.env.PAYSTACK_SECRET_KEY) {
    console.error("❌ Missing Paystack secret key in environment variables");
    return res.status(500).json({ 
      error: "Server misconfiguration",
      message: "Payment system not properly configured"
    });
  }

  try {
    console.log("🟡 Initializing Paystack payment:", {
      email,
      amount: numAmount * 100,
      user_id
    });

    // Prepare the callback URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                    process.env.NEXT_PUBLIC_SITE_URL || 
                    (req.headers.origin || `http://localhost:3000`);
    
    const callbackUrl = `${baseUrl}/wallet/callback`;
    
    console.log("Callback URL:", callbackUrl);

    // Make request to Paystack
    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: numAmount * 100, // Convert to kobo
        callback_url: callbackUrl,
        metadata: { 
          user_id,
          amount: numAmount,
          timestamp: new Date().toISOString()
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 10000, // 10 second timeout
      }
    );

    console.log("✅ Paystack response:", {
      status: response.data.status,
      hasAuthUrl: !!response.data.data?.authorization_url,
      reference: response.data.data?.reference
    });

    // Check if Paystack returned success
    if (!response.data.status) {
      console.error("Paystack returned false status:", response.data);
      return res.status(400).json({ 
        error: "Payment initialization failed",
        message: response.data.message || "Paystack returned an error"
      });
    }

    // Return the Paystack response
    return res.status(200).json(response.data);

  } catch (err) {
    // Detailed error logging
    console.error("❌ Paystack initialization error:", {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status,
      stack: err.stack
    });

    // Handle specific error cases
    if (err.code === 'ECONNABORTED') {
      return res.status(504).json({ 
        error: "Timeout",
        message: "Payment gateway timeout. Please try again."
      });
    }

    if (err.response?.status === 401) {
      return res.status(500).json({ 
        error: "Authentication failed",
        message: "Invalid Paystack secret key"
      });
    }

    if (err.response?.status === 400) {
      return res.status(400).json({ 
        error: "Bad request",
        message: err.response.data.message || "Invalid request to Paystack",
        details: err.response.data
      });
    }

    // Generic error
    return res.status(500).json({ 
      error: "Unable to initiate payment",
      message: err.response?.data?.message || err.message || "Unknown error occurred",
      reference: `error_${Date.now()}`
    });
  }
}