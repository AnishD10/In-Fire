import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

async function testEmail() {
  try {
    console.log('Testing email with:');
    console.log(`User: ${process.env.SMTP_USER}`);
    console.log(`Password length: ${process.env.SMTP_PASSWORD?.length} characters`);
    
    const result = await transporter.sendMail({
      from: process.env.ALERT_FROM_EMAIL,
      to: 'manxekhatra@gmail.com',
      subject: 'Test Email',
      text: 'This is a test email'
    });
    
    console.log('✓ Email sent successfully!');
    console.log('Message ID:', result.messageId);
  } catch (error) {
    console.error('✗ Email failed:');
    console.error(error.message);
  }
  process.exit(0);
}

testEmail();
