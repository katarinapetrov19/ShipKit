import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create Nodemailer transporter
let transporter;

try {
  // Only attempt to initialize SMTP if SMTP_HOST is configured and not default template placeholder
  if (process.env.SMTP_HOST && !process.env.SMTP_HOST.includes('mailtrap.io') && process.env.SMTP_USER !== 'your_smtp_username') {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    console.log('Using simulated/development email transport. Emails will be logged to console.');
  }
} catch (error) {
  console.error('Failed to initialize SMTP transporter, falling back to simulated mailer:', error.message);
}

/**
 * Send an email using real SMTP transport or fallback simulation.
 * @param {Object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text version
 * @param {string} options.html - HTML version
 */
export async function sendEmail({ to, subject, text, html }) {
  const from = process.env.FROM_EMAIL || 'ShipKit <noreply@yourdomain.com>';

  if (transporter) {
    try {
      await transporter.sendMail({
        from,
        to,
        subject,
        text,
        html,
      });
      console.log(`Email successfully sent to: ${to} (Subject: "${subject}")`);
      return { success: true };
    } catch (error) {
      console.error(`SMTP transmission failed to ${to}:`, error.message);
      // Fall through to simulated logs on error
    }
  }

  // Simulated development logging fallback
  console.log('\n=================== SIMULATED EMAIL ===================');
  console.log(`From:    ${from}`);
  console.log(`To:      ${to}`);
  console.log(`Subject: ${subject}`);
  console.log('-------------------------------------------------------');
  console.log('TEXT VERSION:');
  console.log(text);
  console.log('-------------------------------------------------------');
  console.log('HTML VERSION PREVIEW:');
  // Log a compact preview of HTML to not flood the terminal
  console.log(html.replace(/<[^>]*>/g, ' ').substring(0, 300) + '...');
  console.log('=======================================================\n');

  return { success: true, simulated: true };
}
