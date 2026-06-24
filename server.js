import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail', // You can change this to your preferred service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

app.post('/api/send-ticket', async (req, res) => {
  const { email, name, bookingRef, eventTitle, totalTickets, grandTotal, eventDate, eventTime, venue } = req.body;

  if (!email || !bookingRef || !eventTitle) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("EMAIL_USER or EMAIL_PASS not set in .env. Mocking successful email send.");
    return res.status(200).json({ message: 'Email mocked successfully (configure .env to actually send)' });
  }

  const mailOptions = {
    from: `"Padukundam Raa Ticketing" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Your Tickets for ${eventTitle} are Confirmed!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background-color: #ffffff; padding: 30px; border-radius: 12px; border: 1px solid #e5e7eb; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <h1 style="color: #111827; margin-top: 0; font-size: 24px;">Booking Confirmed!</h1>
          <p style="color: #4b5563; font-size: 16px;">Hi ${name},</p>
          <p style="color: #4b5563; font-size: 16px;">Thank you for booking with us. Your tickets for <strong>${eventTitle}</strong> are confirmed.</p>
          
          <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin: 24px 0;">
            <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280; text-transform: uppercase; font-weight: bold;">Booking Reference</p>
            <p style="margin: 0; font-size: 24px; font-weight: bold; color: #111827; font-family: monospace;">${bookingRef}</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Date & Time</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #111827; font-weight: bold; text-align: right;">${eventDate} at ${eventTime}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Venue</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #111827; font-weight: bold; text-align: right;">${venue}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Tickets</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #111827; font-weight: bold; text-align: right;">${totalTickets} Ticket(s)</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #6b7280;">Total Paid</td>
              <td style="padding: 10px 0; color: #111827; font-weight: bold; text-align: right; font-size: 18px;">₹${grandTotal.toLocaleString()}</td>
            </tr>
          </table>

          <div style="margin-top: 30px; text-align: center;">
            <a href="https://paadukundam-dhaaa.vercel.app/ticket/${bookingRef}?download=true" style="display: inline-block; padding: 12px 24px; background-color: #8c1c24; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Download Your Ticket (JPG)</a>
          </div>
          
          <p style="color: #4b5563; font-size: 16px; margin-top: 24px;">You can also view and download your full digital ticket by logging into your account dashboard.</p>
          
          <div style="margin-top: 30px; text-align: center; color: #9ca3af; font-size: 14px;">
            <p>If you have any questions, please contact our support team.</p>
          </div>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: %s', info.messageId);
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
