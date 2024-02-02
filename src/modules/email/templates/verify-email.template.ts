export const getVerifyEmailTemplate = (code: string): string => (
  `<!DOCTYPE html>
  <html lang="en">
  <head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Verification</title>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      padding: 20px;
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }
    .logo {
      text-align: center;
      margin-bottom: 20px;
    }
    img {
      max-width: 100%;
      height: auto;
    }
    .content {
      text-align: left;
    }
    p {
      margin-bottom: 15px;
    }
    .verification-code {
      font-size: 24px;
      font-weight: bold;
      color: #007bff;
    }
  </style>
  </head>
  <body>
  <div class="container">
    <div class="logo">
      <img src="https://res.cloudinary.com/dwp6n7qqj/image/upload/v1706874381/ZenBitRock/icon-512x512_p2amnj.png" alt="ZenBitRock">
    </div>
    <div class="content">
      <p>Thank you for using our service! To complete the email verification process, please use the following verification code:</p>
      <p class="verification-code">Your Verification Code: ${code}</p>
      <p>If you did not request this code, please ignore this email.</p>
      <p>Best regards, </br> ZenBitRock team.</p>
    </div>
  </div>
  </body>
  </html>
`);