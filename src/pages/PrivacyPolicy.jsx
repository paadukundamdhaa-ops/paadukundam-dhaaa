import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

export default function PrivacyPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="pt-24 pb-16 min-h-screen bg-black text-white font-sans">
      <Helmet>
        <title>Privacy Policy | PaadukundamDhaa</title>
      </Helmet>
      <div className="container mx-auto px-6 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-black mb-8 uppercase tracking-wide">Privacy Policy</h1>
        
        <div className="prose prose-invert max-w-none prose-p:text-gray-300 prose-headings:text-white">
          <p className="mb-6">At PaadukundamDhaa, we are committed to protecting your privacy and ensuring the security of your personal information.</p>
          
          <h2 className="text-2xl font-bold mt-8 mb-4">1. Information We Collect</h2>
          <p className="mb-4">We may collect personal information such as your name, email address, phone number, and payment details when you create an account, purchase tickets, or contact support.</p>
          
          <h2 className="text-2xl font-bold mt-8 mb-4">2. How We Use Your Information</h2>
          <p className="mb-4">Your information is used strictly to process transactions, deliver tickets, communicate important event updates, and improve our platform's services.</p>

          <h2 className="text-2xl font-bold mt-8 mb-4">3. Data Security</h2>
          <p className="mb-4">We employ industry-standard security measures to protect your data from unauthorized access, disclosure, or destruction. Payment transactions are processed through secure gateways.</p>

          <h2 className="text-2xl font-bold mt-8 mb-4">4. Third-Party Services</h2>
          <p className="mb-4">We do not sell your personal data. We may share necessary information with event organizers and payment processors solely for the purpose of fulfilling your booking.</p>
        </div>
      </div>
    </div>
  );
}
