import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

export default function TermsConditions() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="pt-24 pb-16 min-h-screen bg-black text-white font-sans">
      <Helmet>
        <title>Terms & Conditions | PaadukundamDhaa</title>
      </Helmet>
      <div className="container mx-auto px-6 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-black mb-8 uppercase tracking-wide">Terms & Conditions</h1>
        
        <div className="prose prose-invert max-w-none prose-p:text-gray-300 prose-headings:text-white">
          <p className="mb-6">Welcome to PaadukundamDhaa. By accessing or using our website and services, you agree to comply with and be bound by the following terms and conditions.</p>
          
          <h2 className="text-2xl font-bold mt-8 mb-4">1. General Terms</h2>
          <p className="mb-4">These terms govern your use of the PaadukundamDhaa ticketing platform. All ticket sales are final and subject to availability.</p>
          
          <h2 className="text-2xl font-bold mt-8 mb-4">2. Event Entry</h2>
          <p className="mb-4">A valid ticket must be presented at the venue. The event organizers reserve the right to refuse admission or remove any person whose conduct is deemed disorderly or unbecoming.</p>

          <h2 className="text-2xl font-bold mt-8 mb-4">3. Platform Fees</h2>
          <p className="mb-4">A platform convenience fee may be charged per ticket during checkout. This fee covers payment processing and ticketing infrastructure costs.</p>

          <h2 className="text-2xl font-bold mt-8 mb-4">4. Liability</h2>
          <p className="mb-4">PaadukundamDhaa acts solely as a ticketing platform and is not liable for any personal injury, loss, or damage to property at the venue during the event.</p>
        </div>
      </div>
    </div>
  );
}
