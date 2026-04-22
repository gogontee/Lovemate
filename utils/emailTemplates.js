// utils/emailTemplates.js

export const getPasswordResetEmail = (resetLink, userName = 'Valued Member') => {
  // Use the specific Supabase logo URL you provided
  // This URL will work once your storage bucket is public
  const logoUrl = 'https://pztuwangpzlzrihblnta.supabase.co/storage/v1/object/public/asset/logo/lovemateshow.png';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #fdf2f8;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #ffffff;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          padding: 20px 0;
          border-bottom: 2px solid #f43f5e;
        }
        .logo-container {
          text-align: center;
          margin-bottom: 10px;
        }
        .logo-img {
          max-width: 100px;
          height: auto;
          display: inline-block;
        }
        .logo-text {
          font-size: 24px;
          font-weight: bold;
          color: #e11d48;
          margin-top: 10px;
        }
        .content {
          padding: 30px 20px;
        }
        .button {
          display: inline-block;
          padding: 12px 30px;
          background: linear-gradient(135deg, #e11d48 0%, #f43f5e 100%);
          color: white !important;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          margin: 20px 0;
          text-align: center;
        }
        .button:hover {
          background: linear-gradient(135deg, #be123c 0%, #e11d48 100%);
        }
        .footer {
          text-align: center;
          padding: 20px;
          font-size: 12px;
          color: #6c757d;
          border-top: 1px solid #e9ecef;
        }
        .warning {
          background-color: #fef2f2;
          border-left: 4px solid #e11d48;
          padding: 12px;
          margin: 20px 0;
          font-size: 14px;
        }
        @media only screen and (max-width: 480px) {
          .container {
            padding: 10px;
          }
          .logo-img {
            max-width: 70px;
          }
          .button {
            display: block;
            text-align: center;
          }
        }
      </style>
    </head>
    <body style="background-color: #fdf2f8; margin: 0; padding: 20px;">
      <div class="container">
        <div class="header">
          <div class="logo-container">
            <img 
              src="${logoUrl}" 
              alt="Lovemate Show Logo" 
              class="logo-img" 
              style="max-width: 100px; height: auto; display: block; margin: 0 auto;"
              width="100"
              height="auto"
              border="0"
            >
          </div>
          <div class="logo-text">Lovemate Show</div>
        </div>
        
        <div class="content">
          <h2 style="color: #333; margin-bottom: 16px;">Hello ${userName}! 👋</h2>
          <p style="margin-bottom: 16px;">We received a request to reset your password for your Lovemate Show account.</p>
          <p style="margin-bottom: 24px;">Click the button below to create a new password:</p>
          
          <div style="text-align: center;">
            <a href="${resetLink}" class="button">Reset Password 🔐</a>
          </div>
          
          <div class="warning">
            <strong>⚠️ This link will expire in 1 hour</strong><br>
            If you didn't request this, you can safely ignore this email.
          </div>
          
          <p style="margin-top: 24px; font-size: 14px; color: #6c757d;">
            Or copy and paste this link into your browser:<br>
            <a href="${resetLink}" style="color: #e11d48; word-break: break-all;">${resetLink}</a>
          </p>
        </div>
        
        <div class="footer">
          <p>&copy; 2024 Lovemate Show. All rights reserved.</p>
          <p>Making love connections around the world 💕</p>
        </div>
      </div>
    </body>
    </html>
  `;
};