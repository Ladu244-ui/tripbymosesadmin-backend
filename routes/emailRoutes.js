const express = require('express');
const router = express.Router();

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

// Generate a random one-time password
const generateOneTimePassword = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// POST endpoint to send admin welcome email
router.post('/send-admin-welcome', async (req, res) => {
  try {
    const { adminData, oneTimePassword } = req.body;

    // Validate required fields
    if (!adminData || !adminData.email || !adminData.firstName || !adminData.lastName) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required admin data' 
      });
    }

    if (!oneTimePassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing one-time password' 
      });
    }

    // Check if API key is configured
    if (!process.env.SENDGRID_API_KEY) {
      console.error('SENDGRID_API_KEY not found in environment variables');
      return res.status(500).json({
        success: false,
        message: 'Email service not configured. Please set SENDGRID_API_KEY environment variable.'
      });
    }

    const emailContent = {
      sender: {
        email: 'henrymosesuk1@gmail.com', 
        name: 'TripsByMoses Admin System'
      },
      to: [
        {
          email: adminData.email,
          name: `${adminData.firstName} ${adminData.lastName}`
        }
      ],
      replyTo: {
        email: 'henrymosesuk1@gmail.com',
        name: 'TripsByMoses Support'
      },
      subject: 'Welcome to TripsByMoses Admin Panel - Setup Your Account',
      textContent: `Welcome to TripsByMoses Admin Panel!

Dear ${adminData.firstName} ${adminData.lastName},

Your admin account has been created successfully. You have been assigned the role of "${adminData.roleName}".

Your Login Credentials:
Email: ${adminData.email}
One-Time Password: ${oneTimePassword}

IMPORTANT INSTRUCTIONS FOR FIRST LOGIN:

1. Visit the admin panel at: ${adminData.loginUrl || 'https://your-domain.com/login'}
2. Login using your email and the one-time password provided above
3. You will be prompted to create a new secure password
4. After setting your password, your account will be activated automatically

Security Note: This one-time password will be deleted once you set your permanent password. Please complete this setup as soon as possible.

${adminData.instructions ? `\nAdditional Instructions:\n${adminData.instructions}\n` : ''}

If you have any questions or need assistance, please contact our support team.

Best regards,
TripsByMoses Admin Team

---
This is an automated message. Please do not reply to this email.`,
      htmlContent: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to TripsByMoses Admin Panel</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; max-width: 600px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <tr>
            <td style="background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: #ffffff; font-size: 28px; margin: 0; font-weight: bold;">TripsByMoses</h1>
              <p style="color: #e3f2fd; font-size: 16px; margin: 10px 0 0 0;">Admin Panel Access</p>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 40px;">
              <h2 style="color: #1976d2; font-size: 24px; margin: 0 0 20px 0;">Welcome to the Team!</h2>
              <p style="color: #424242; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Dear <strong>${adminData.firstName} ${adminData.lastName}</strong>,
              </p>
              <p style="color: #424242; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Your admin account has been created successfully. You have been assigned the role of <strong>"${adminData.roleName}"</strong>.
              </p>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f5; border-radius: 8px; border: 2px solid #1976d2;">
                <tr>
                  <td style="padding: 30px;">
                    <h3 style="color: #1976d2; font-size: 18px; margin: 0 0 20px 0; text-align: center;">Your Login Credentials</h3>
                    
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding: 10px 0;">
                          <p style="color: #757575; font-size: 14px; margin: 0 0 5px 0;">Email Address:</p>
                          <p style="color: #212121; font-size: 16px; font-weight: bold; margin: 0; word-break: break-all;">${adminData.email}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 20px 0 10px 0;">
                          <p style="color: #757575; font-size: 14px; margin: 0 0 5px 0;">One-Time Password:</p>
                          <p style="color: #d32f2f; font-size: 24px; font-weight: bold; margin: 0; letter-spacing: 4px; font-family: 'Courier New', monospace;">${oneTimePassword}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <h3 style="color: #1976d2; font-size: 18px; margin: 0 0 15px 0;">First Login Instructions:</h3>
              <ol style="color: #424242; font-size: 15px; line-height: 1.8; margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 10px;">Visit the admin panel at: <a href="${adminData.loginUrl || 'https://your-domain.com/login'}" style="color: #1976d2; text-decoration: none; font-weight: bold;">${adminData.loginUrl || 'https://your-domain.com/login'}</a></li>
                <li style="margin-bottom: 10px;">Login using your email and the one-time password provided above</li>
                <li style="margin-bottom: 10px;">You will be prompted to create a new secure password</li>
                <li style="margin-bottom: 10px;">After setting your password, your account will be activated automatically</li>
              </ol>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #fff3e0; border-left: 4px solid #ff9800; border-radius: 4px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="color: #e65100; font-size: 14px; margin: 0; line-height: 1.6;">
                      <strong>Security Note:</strong> This one-time password will be deleted once you set your permanent password. Please complete this setup as soon as possible for security reasons.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          ${adminData.instructions ? `
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #e3f2fd; border-radius: 4px;">
                <tr>
                  <td style="padding: 20px;">
                    <h4 style="color: #1976d2; font-size: 16px; margin: 0 0 10px 0;">Additional Instructions:</h4>
                    <p style="color: #424242; font-size: 14px; margin: 0; line-height: 1.6; white-space: pre-line;">${adminData.instructions}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ` : ''}
          
          <tr>
            <td style="padding: 0 40px 40px 40px; text-align: center;">
              <a href="${adminData.loginUrl || 'https://your-domain.com/login'}" style="display: inline-block; background-color: #1976d2; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 6px; font-size: 16px; font-weight: bold; box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);">Login to Admin Panel</a>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 30px 40px; background-color: #f5f5f5; border-radius: 0 0 8px 8px; border-top: 1px solid #e0e0e0;">
              <p style="color: #757575; font-size: 14px; text-align: center; margin: 0 0 10px 0;">
                If you have any questions or need assistance, please contact our support team.
              </p>
              <p style="color: #9e9e9e; font-size: 12px; text-align: center; margin: 0;">
                Best regards,<br>
                <strong>TripsByMoses Admin Team</strong>
              </p>
              <p style="color: #bdbdbd; font-size: 11px; text-align: center; margin: 20px 0 0 0;">
                This is an automated message. Please do not reply to this email.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
    };

    // Make request to Brevo API
    const response = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'api-key': process.env.SENDGRID_API_KEY, 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailContent)
    });

    // Brevo returns 201 for successful email sending
    if (response.ok || response.status === 201) {
      console.log('Welcome email sent successfully to:', adminData.email);
      return res.json({ 
        success: true, 
        message: 'Welcome email sent successfully' 
      });
    } else {
      // Get error details
      const errorText = await response.text();
      let errorDetails;
      
      try {
        errorDetails = JSON.parse(errorText);
      } catch (e) {
        errorDetails = { message: errorText };
      }

      console.error('Brevo API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorDetails
      });

      return res.status(response.status).json({
        success: false,
        message: 'Failed to send email',
        error: errorDetails.errors || errorDetails.message || 'Unknown error',
        statusCode: response.status
      });
    }

  } catch (error) {
    console.error('Error sending welcome email:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Error sending email',
      error: error.message
    });
  }
});

// Test endpoint to verify setup
router.get('/test', (req, res) => {
  const apiKeySet = !!process.env.SENDGRID_API_KEY;
  const apiKeyPreview = process.env.SENDGRID_API_KEY 
    ? `${process.env.SENDGRID_API_KEY.substring(0, 10)}...` 
    : 'NOT SET';

  res.json({
    status: 'Email service is running',
    service: 'Brevo (Sendinblue)',
    apiKeyConfigured: apiKeySet,
    apiKeyPreview: apiKeyPreview,
    endpoint: BREVO_API_URL
  });
});

module.exports = router;
