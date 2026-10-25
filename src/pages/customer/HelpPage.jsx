import React, { useState } from 'react';
import { HelpCircle, MessageSquare, ChevronDown, ChevronUp, Mail, CheckCircle } from 'lucide-react';

const HelpPage = () => {
  const [openIndex, setOpenIndex] = useState(0);
  const [supportForm, setSupportForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const faqs = [
    {
      q: 'How does live seat locking work on CineVerse AI?',
      a: 'When you click an available seat, CineVerse AI broadcasts an atomic temporary lock across the network via Socket.IO. The seat is reserved solely for you for exactly 5 minutes while you review your order and complete the simulated payment. If the timer expires before payment, the seat lock is released automatically for other moviegoers.'
    },
    {
      q: 'Is any real money charged during payment?',
      a: 'No. CineVerse AI operates exclusively with a simulated demo payment gateway (supporting UPI, Card, and Wallet flows). No real bank transfers or card charges occur, and no actual card details are ever stored.'
    },
    {
      q: 'How do I use my digital QR ticket at the theatre gate?',
      a: 'After successful booking, a digital ticket with a cryptographically verifiable QR code is generated. You can view or print it anytime under "My Bookings". Authorized theatre ticket checkers use the CineVerse Theatre Gate Scanner to scan the code and mark admission in real time, preventing duplicate entries.'
    },
    {
      q: 'How does the Group Booking and Split Payment feature work?',
      a: 'Initiate a group booking from the Group Booking page, select your movie and seats, and share the unique booking code with friends. Each participant can view the total bill split equally and simulate their share of payment until the group booking is confirmed.'
    },
    {
      q: 'How do I earn and redeem reward points?',
      a: 'Every completed demo booking automatically awards 10 reward points per ticket booked. You can apply points or promo codes (e.g., CINEVERSE50, BLOCKBUSTER100) directly during checkout.'
    }
  ];

  const handleSupportSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setSupportForm({ name: '', email: '', subject: '', message: '' });
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="min-h-screen py-10 px-4 max-w-5xl mx-auto space-y-12">
      {/* Header Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-primary/10 border border-accent-primary/30 text-accent-secondary text-xs font-semibold">
          <HelpCircle className="w-3.5 h-3.5" /> Support & Knowledge Base
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">How can we help you today?</h1>
        <p className="text-navy-300 max-w-xl mx-auto text-sm">
          Browse our frequently asked questions below or submit a support inquiry.
        </p>
      </div>

      {/* FAQs Section */}
      <div className="bg-navy-900/50 border border-navy-800 rounded-2xl p-6 sm:p-8 backdrop-blur-md">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2.5">
          <HelpCircle className="w-5 h-5 text-accent-secondary" />
          Frequently Asked Questions
        </h2>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="border border-navy-800 rounded-xl overflow-hidden bg-navy-950/60 transition"
            >
              <button
                onClick={() => setOpenIndex(openIndex === idx ? -1 : idx)}
                className="w-full py-4 px-5 flex items-center justify-between text-left font-medium text-navy-100 hover:text-white"
              >
                <span className="text-sm font-semibold">{faq.q}</span>
                {openIndex === idx ? (
                  <ChevronUp className="w-4 h-4 text-accent-secondary shrink-0 ml-3" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-navy-400 shrink-0 ml-3" />
                )}
              </button>
              {openIndex === idx && (
                <div className="px-5 pb-4 text-xs sm:text-sm text-navy-300 border-t border-navy-800/60 pt-3 leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact Form */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 bg-navy-900/50 border border-navy-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-accent-secondary font-semibold text-sm">
            <Mail className="w-4 h-4" /> Customer Care
          </div>
          <h3 className="text-lg font-bold text-white">We're here for you 24/7</h3>
          <p className="text-xs text-navy-300 leading-relaxed">
            Need help with a show cancellation, group booking invitation, or ticket check-in at the theatre? Drop us a line.
          </p>
          <div className="space-y-2 pt-2 text-xs text-navy-400">
            <p><strong className="text-white">Email:</strong> support@cineverse.ai</p>
            <p><strong className="text-white">Helpline:</strong> 1800-CINEMA-AI (Demo)</p>
            <p><strong className="text-white">Hours:</strong> 09:00 AM - 11:30 PM IST</p>
          </div>
        </div>

        <div className="md:col-span-2 bg-navy-900/50 border border-navy-800 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-accent-primary" />
            Send a Query to Support
          </h3>

          {submitted && (
            <div className="p-3 mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Thank you! Your demo support query has been logged. Our team will review it.</span>
            </div>
          )}

          <form onSubmit={handleSupportSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-navy-300 mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="Vikas K"
                  value={supportForm.name}
                  onChange={(e) => setSupportForm({ ...supportForm, name: e.target.value })}
                  className="w-full bg-navy-950/80 border border-navy-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-accent-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-navy-300 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="vikas@example.com"
                  value={supportForm.email}
                  onChange={(e) => setSupportForm({ ...supportForm, email: e.target.value })}
                  className="w-full bg-navy-950/80 border border-navy-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-accent-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-navy-300 mb-1">Subject</label>
              <input
                type="text"
                required
                placeholder="Seat lock query / Booking question"
                value={supportForm.subject}
                onChange={(e) => setSupportForm({ ...supportForm, subject: e.target.value })}
                className="w-full bg-navy-950/80 border border-navy-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-accent-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-navy-300 mb-1">Message</label>
              <textarea
                rows={3}
                required
                placeholder="Describe your question or issue in detail..."
                value={supportForm.message}
                onChange={(e) => setSupportForm({ ...supportForm, message: e.target.value })}
                className="w-full bg-navy-950/80 border border-navy-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-accent-primary"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-accent-primary hover:bg-accent-primary/90 text-white font-medium rounded-xl text-xs transition"
            >
              Submit Ticket
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
