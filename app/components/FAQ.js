'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const faqData = [
  {
    question: "What is Bruno Verifies?",
    answer: "Bruno Verifies is a secure, automated system designed to verify Brown University students and alumni. Once verified, you'll receive special roles in our Discord server."
  },
  {
    question: "How do I get verified?",
    answer: "Log in with your Discord account, then provide your Brown email address. We'll send you a 6-digit code. Enter that code on our site or via the /confirm command in Discord to get your roles."
  },
  {
    question: "Is my email address stored?",
    answer: "No. We only store a secure SHA-256 hash of your email. This allows us to prevent duplicate verifications without ever keeping your actual email address in our database."
  },
  {
    question: "I didn't receive my code. What should I do?",
    answer: "Check your spam folder first. If it's not there, wait 60 seconds and use the 'Resend Code' button. Make sure you entered your username correctly (the part before @brown.edu)."
  },
  {
    question: "Can I verify multiple Discord accounts with one email?",
    answer: "No, each Brown email can only be linked to one Discord account at a time to ensure the integrity of our community roles."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-20 mb-20 px-6">
      <h2 className="text-3xl font-black text-[#591C0B] dark:text-amber-500 mb-8 text-center uppercase tracking-tight">
        Frequently Asked Questions
      </h2>
      <div className="space-y-4">
        {faqData.map((item, index) => (
          <div
            key={index}
            className="border-2 border-[#591C0B]/10 dark:border-white/10 rounded-2xl overflow-hidden transition-all bg-white dark:bg-stone-800 shadow-sm"
          >
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full flex items-center justify-between p-5 text-left font-bold text-[#591C0B] dark:text-amber-200 hover:bg-[#FDFBF7] dark:hover:bg-stone-700 transition-colors"
            >
              <span className="text-lg">{item.question}</span>
              {openIndex === index ? (
                <ChevronUp className="w-5 h-5 flex-shrink-0" />
              ) : (
                <ChevronDown className="w-5 h-5 flex-shrink-0" />
              )}
            </button>
            <div
              className={`transition-all duration-300 ease-in-out overflow-hidden ${
                openIndex === index ? 'max-h-48' : 'max-h-0'
              }`}
            >
              <div className="p-5 pt-0 text-[#8C6B5D] dark:text-stone-400 font-medium leading-relaxed">
                {item.answer}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
