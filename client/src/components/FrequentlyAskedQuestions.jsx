import { useState } from 'react';
import { HiChevronDown, HiChevronUp } from 'react-icons/hi';

export default function FrequentlyAskedQuestions() {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleQuestion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const faqItems = [
    {
      question: "How can I make a donation?",
      answer: "You can donate through our secure online portal using a credit or debit card. Simply choose the cause you'd like to support and follow the instructions. All transactions are encrypted and secure."
    },
    {
      question: "Can I choose where my donation goes?",
      answer: "Yes! We offer multiple causes you can support. Browse our donation page to see current fundraising campaigns and select the one that resonates most with you. You can also make a general donation that will be distributed across all active causes."
    },
    {
      question: "Is my donation tax-deductible?",
      answer: "Many donations made through our platform are tax-deductible, depending on your location and the specific cause. You'll receive a receipt for your donation that you can use for tax purposes. We recommend consulting with a tax professional for advice specific to your situation."
    },
    {
      question: "How do I know my donation is being used properly?",
      answer: "We maintain complete transparency about how funds are used. Each cause provides regular updates on progress and impact. We also publish impact reports on our website and send them directly to donors via email. You can track the campaigns you've supported from your user dashboard."
    },
    {
      question: "Can I make a recurring donation?",
      answer: "Absolutely! When making a donation, you'll see an option to make it recurring - monthly, quarterly, or annually. Recurring donations help us plan for the future and provide consistent support to ongoing initiatives. You can cancel or modify your recurring donation at any time."
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-slate-50 to-white dark:from-gray-800 dark:to-gray-900 relative">
      {/* Decorative elements */}
      <div className="hidden lg:block absolute top-0 right-0 w-40 h-40 bg-teal-100 dark:bg-teal-900/20 rounded-full opacity-40 transform translate-x-20 -translate-y-20"></div>
      <div className="hidden lg:block absolute bottom-0 left-0 w-32 h-32 bg-purple-100 dark:bg-purple-900/20 rounded-full opacity-30 transform -translate-x-10 translate-y-10"></div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          <div className="mx-auto w-20 h-1 bg-gradient-to-r from-teal-400 to-purple-500 rounded-full mb-6"></div>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Find answers to the most common questions about donations, contributions, and how you can make an impact.
          </p>
        </div>
        
        <div className="space-y-4">
          {faqItems.map((item, index) => (
            <div 
              key={index}
              className={`border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900 shadow-sm transition-all duration-300 ${
                activeIndex === index 
                  ? 'shadow-md border-l-4 border-l-teal-500 dark:border-l-teal-400' 
                  : 'hover:shadow-md hover:border-l-4 hover:border-l-teal-500 dark:hover:border-l-teal-400'
              }`}
            >
              <button
                onClick={() => toggleQuestion(index)}
                className="flex justify-between items-center w-full px-6 py-5 text-left transition-colors duration-200"
                aria-expanded={activeIndex === index}
              >
                <h3 className={`font-semibold text-lg ${
                  activeIndex === index 
                    ? 'text-teal-700 dark:text-teal-300' 
                    : 'text-gray-800 dark:text-gray-100'
                }`}>
                  {item.question}
                </h3>
                <span className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors duration-300 ${
                  activeIndex === index 
                    ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400' 
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                }`}>
                  {activeIndex === index ? <HiChevronUp size={20} /> : <HiChevronDown size={20} />}
                </span>
              </button>
              
              <div 
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  activeIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-6 py-5 border-t border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900">
                  {item.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 