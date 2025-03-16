const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

let transporter = null;

function createTransporter() {
  if (transporter) return transporter;
  try {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    // Test the transporter connection on startup
    transporter.verify((error) => {
      if (error) {
        console.error('Email connection failed:', error);
      } else {
        console.log('Email service is ready to send emails.');
      }
    });
    return transporter;
  } catch (error) {
    console.error('Email transporter creation failed:', error);
    return null;
  }
}

async function sendConfirmationEmail(email, capsule, capsuleId, accessToken = null) {
  const transporter = createTransporter();
  if (!transporter) {
    console.error('Email transporter not configured');
    return;
  }

  try {
    const unlockDate = new Date(capsule.unlock_date);
    const formattedDate = unlockDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Virtual Time Capsule" <noreply@virtualcapsule.com>',
      to: email,
      subject: '🕰️ Your Time Capsule Has Been Buried!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #6d28d9;">Your Time Capsule is Safely Stored</h1>
          <p>Hello,</p>
          <p>Your time capsule <strong>"${capsule.capsule_name}"</strong> has been successfully buried and will be available to open on <strong>${formattedDate}</strong>.</p>
          
          ${
            accessToken
              ? `
            <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3>Private Capsule Access Token</h3>
              <p>To access your private capsule when it's ready, you'll need this access token:</p>
              <code style="background-color: #e0e0e0; padding: 10px; display: block; font-family: monospace;">${accessToken}</code>
              <p><small>Please save this email for future reference.</small></p>
            </div>
          `
              : ''
          }
          
          <p>Thank you for using Virtual Time Capsule!</p>
          <hr>
          <small>If you did not create this time capsule, please ignore this email.</small>
        </div>
      `,
      text: `
        Your Time Capsule is Safely Stored

        Hello,
        Your time capsule "${capsule.capsule_name}" has been successfully buried and will be available to open on ${formattedDate}.

        ${accessToken ? `Access Token: ${accessToken}` : ''}

        Thank you for using Virtual Time Capsule!
      `
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending confirmation email:', error);
  }
}

module.exports = { sendConfirmationEmail };