import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

export default function ShippingPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="pt-24 pb-16 min-h-screen bg-black text-white font-sans">
      <Helmet>
        <title>Shipping & Delivery Policy | PaadukundamDhaa</title>
      </Helmet>
      <div className="container mx-auto px-6 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-black mb-8 uppercase tracking-wide">Shipping & Delivery Policy</h1>
        
        <div className="prose prose-invert max-w-none prose-p:text-gray-300 prose-headings:text-white">
          <p className="mb-6">At PaadukundamDhaa, we provide digital ticketing services for live events and concerts.</p>
          
          <h2 className="text-2xl font-bold mt-8 mb-4">1. Digital Delivery</h2>
          <p className="mb-4">Since our services involve the sale of event tickets, no physical shipping of items is required. All tickets purchased through our platform are delivered digitally.</p>
          
          <h2 className="text-2xl font-bold mt-8 mb-4">2. Delivery Method</h2>
          <p className="mb-4">Upon successful completion of payment, your ticket(s) along with a unique QR code will be delivered instantly to the email address provided during the booking process.</p>

          <h2 className="text-2xl font-bold mt-8 mb-4">3. Delivery Time</h2>
          <p className="mb-4">Digital delivery is instantaneous. You should receive your ticket confirmation email within a few minutes of successful payment. You can also view and download your tickets directly from your Dashboard on our website.</p>

          <h2 className="text-2xl font-bold mt-8 mb-4">4. Issues with Delivery</h2>
          <p className="mb-4">If you do not receive your ticket confirmation email within 15 minutes of a successful payment, please check your Spam/Junk folder. If it is still not found, please contact our support team immediately at paadukundam.dhaa@gmail.com with your transaction details.</p>

          <h2 className="text-2xl font-bold mt-8 mb-4">5. Contact Us</h2>
          <p className="mb-4">
            If you have any questions about this Shipping & Delivery Policy, please contact us at:<br /><br />
            <strong>Address:</strong> Vidhyuth Nagar, SBI Officers Colony, Kakinada, Andhra Pradesh 533003, India. (68-8-17/B)<br />
            <strong>Email:</strong> paadukundam.dhaa@gmail.com<br />
            <strong>Phone:</strong> 80080 33573
          </p>
        </div>
      </div>
    </div>
  );
}
