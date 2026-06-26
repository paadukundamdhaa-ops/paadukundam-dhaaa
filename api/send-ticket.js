import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { email, name, eventTitle, eventDate, eventVenue, eventCity, bookingRef, qty, amount, subtotal, discount, platformFee, termsAndConditions } = req.body;

  if (!email || !bookingRef) {
    return res.status(400).json({ message: 'Missing required fields: email and bookingRef are required' });
  }

  try {
    // Check if SMTP variables are configured
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn("SMTP environment variables are missing.");
      return res.status(500).json({ message: 'Email configuration is missing on the server.' });
    }

    // Configure the nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 465,
      secure: process.env.SMTP_PORT == 465, // true for port 465, false for others (like 587)
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const ticketUrl = `https://paadukundam-dhaaa.vercel.app/ticket/${bookingRef}`;
    
    // Generate a QR code URL for the ticket
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(ticketUrl)}`;

    const locationString = [eventVenue, eventCity].filter(Boolean).join(', ') || 'TBA';
    const mapsUrl = locationString !== 'TBA' 
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationString)}`
      : '#';

    const htmlContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 12px; background-color: #ffffff;">
        
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://paadukundam-dhaaa.vercel.app/images/LOGO%20__%20Option%2002.png" alt="PaadukundamDhaa Logo" style="height: 70px; object-fit: contain; margin: 0 auto;" />
          <p style="color: #666; font-size: 14px; margin-top: 10px;">Your Official Event Ticket</p>
        </div>
        
        <p style="font-size: 16px; color: #333;">Hi <strong>${name || 'there'}</strong>,</p>
        <p style="font-size: 16px; color: #333; line-height: 1.5;">Thank you for your purchase! Your booking has been confirmed and your ticket is ready.</p>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 10px; margin: 25px 0; border: 1px solid #e2e8f0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Event</td>
              <td style="padding: 8px 0; color: #0f172a; font-weight: bold; text-align: right;">${eventTitle}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Date</td>
              <td style="padding: 8px 0; color: #0f172a; font-weight: bold; text-align: right;">${eventDate}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 14px; vertical-align: top;">Location</td>
              <td style="padding: 8px 0; color: #0f172a; font-weight: bold; text-align: right;">
                ${locationString}<br/>
                ${mapsUrl !== '#' ? `<a href="${mapsUrl}" target="_blank" style="color: #e50914; font-size: 12px; text-decoration: underline;">View on Maps</a>` : ''}
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Booking Ref</td>
              <td style="padding: 8px 0; color: #0f172a; font-weight: bold; text-align: right;">${bookingRef}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Ticket Cost (${qty}x)</td>
              <td style="padding: 8px 0; color: #0f172a; font-weight: bold; text-align: right;">₹${subtotal || amount}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Platform Fee</td>
              <td style="padding: 8px 0; color: #0f172a; font-weight: bold; text-align: right;">₹${platformFee || 15}</td>
            </tr>
            ${discount > 0 ? `
            <tr>
              <td style="padding: 8px 0; color: #16a34a; font-size: 14px; font-weight: bold;">Discount Applied</td>
              <td style="padding: 8px 0; color: #16a34a; font-weight: bold; text-align: right;">-₹${discount}</td>
            </tr>
            ` : ''}
            <tr style="border-top: 1px solid #e2e8f0;">
              <td style="padding: 12px 0 0 0; color: #64748b; font-size: 14px; font-weight: bold;">Total Paid</td>
              <td style="padding: 12px 0 0 0; color: #0f172a; font-weight: 900; font-size: 18px; text-align: right;">₹${amount}</td>
            </tr>
          </table>
        </div>
        
        <div style="text-align: center; margin: 35px 0;">
          <p style="font-size: 14px; color: #64748b; margin-bottom: 15px; font-weight: bold;">Present this QR code at the entrance</p>
          <img src="${qrCodeUrl}" alt="Ticket QR Code" style="width: 180px; height: 180px; border: 4px solid #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 12px;" />
        </div>
        
        <div style="text-align: center; margin-bottom: 30px;">
          <a href="${ticketUrl}" style="background-color: #ffffff; border: 2px solid #e50914; color: #e50914; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 14px; margin-right: 10px; margin-bottom: 10px;">View Ticket Online</a>
          <a href="${ticketUrl}?download=true" style="background-color: #e50914; border: 2px solid #e50914; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 14px; margin-bottom: 10px;">Download Ticket (JPG)</a>
        </div>
        
        ${termsAndConditions ? `
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px dashed #cbd5e1;">
          <h4 style="font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;">Terms & Conditions</h4>
          <div style="font-size: 11px; color: #64748b; line-height: 1.6; white-space: pre-wrap; background-color: #f8fafc; padding: 15px; border-radius: 8px;">${termsAndConditions}</div>
        </div>
        ` : ''}
        
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
        <p style="font-size: 12px; color: #94a3b8; text-align: center; line-height: 1.6;">
          Need help? Contact us at <a href="mailto:admin@paadukundamdhaa.com" style="color: #e50914; text-decoration: none;">admin@paadukundamdhaa.com</a><br/>
          &copy; ${new Date().getFullYear()} PaadukundamDhaa. All rights reserved.
        </p>
      </div>
    `;

    // Send the email
    const info = await transporter.sendMail({
      from: `"PaadukundamDhaa" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `Your Ticket Confirmed: ${eventTitle} (${bookingRef})`,
      html: htmlContent,
    });

    res.status(200).json({ success: true, message: 'Email sent successfully', messageId: info.messageId });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ success: false, message: 'Error sending email', error: error.message });
  }
}
