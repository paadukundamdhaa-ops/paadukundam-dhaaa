import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

export default function RefundPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="pt-24 pb-16 min-h-screen bg-black text-white font-sans">
      <Helmet>
        <title>Refund & Cancellation Policy | PaadukundamDhaa</title>
      </Helmet>
      <div className="container mx-auto px-6 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-black mb-8 uppercase tracking-wide text-primary">Refund & Cancellation</h1>
        
        <div className="prose prose-invert max-w-none prose-p:text-gray-300 prose-headings:text-white">
          <div className="bg-primary/20 border-l-4 border-primary p-6 mb-8 rounded-r-lg">
            <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-wide">Strict No Refund & No Cancellation Policy</h3>
            <p className="text-white/90">
              All ticket sales are final. PaadukundamDhaa operates under a strict "No Refund" and "No Cancellation" policy for all events.
            </p>
          </div>

          <h2 className="text-2xl font-bold mt-8 mb-4">1. Ticket Purchases</h2>
          <p className="mb-4">Once a ticket is successfully purchased, it cannot be canceled, refunded, exchanged, or transferred under any circumstances.</p>
          
          <h2 className="text-2xl font-bold mt-8 mb-4">2. Event Postponement or Cancellation</h2>
          <p className="mb-4">In the rare event that a concert or show is entirely canceled by the organizers, refund procedures will be communicated to the registered email address. However, if an event is postponed or rescheduled to a different date, tickets will remain valid for the new date and no refunds will be issued.</p>

          <h2 className="text-2xl font-bold mt-8 mb-4">3. Platform Fees</h2>
          <p className="mb-4">Any platform or convenience fees charged during the booking process are strictly non-refundable.</p>

          <h2 className="text-2xl font-bold mt-8 mb-4">4. Lost or Stolen Tickets</h2>
          <p className="mb-4">We are not responsible for lost, stolen, or duplicated tickets. The first scanned instance of a valid ticket QR code will be granted entry, and subsequent scans will be denied.</p>
        </div>
      </div>
    </div>
  );
}
