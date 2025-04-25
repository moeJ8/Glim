import { useState } from 'react';
import { HiChevronDown, HiChevronUp } from 'react-icons/hi';

export default function FrequentlyAskedQuestions() {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleQuestion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const faqItems = [
    {
      question: "What is this platform about?",
      answer: "Our platform is a community space for knowledge sharing, storytelling, and connecting people. Users can interact with posts by commenting, sharing ideas, and engaging with content. The platform also features help request stories where community members can offer support to those in need across various areas such as medical, education, housing, food security, and emergency situations."
    },
    {
      question: "How can I participate in the community?",
      answer: "There are many ways to participate! You can comment on posts, share your thoughts, engage with other users' content, and help those who have posted requests for assistance. By actively participating in discussions and providing valuable feedback, you contribute to building our knowledge-sharing community."
    },
    {
      question: "What's the difference between regular users and publishers?",
      answer: "Regular users can comment on posts, interact with content, and request help through stories (which publishers will help publish). Publishers have additional capabilities to create blog posts. Publishers help maintain content quality and assist regular users in sharing their stories with the community."
    },
    {
      question: "How do I share my story if I'm not a publisher?",
      answer: "If you're not a publisher but want to share your story or request help, you can reach out to an existing publisher who can help publish it for you. You'll need to provide them with your story details, and they'll format and publish it on your behalf. Your contact information will be included so that helpers can reach you directly."
    },
    {
      question: "How can I become a publisher?",
      answer: "To become a publisher, simply click on the 'Become a Publisher' button in the call-to-action section of the website. Our admin team will review your request based on your contribution history, understanding of community guidelines, and commitment to quality content. Publishers play an important role in helping maintain content standards and assisting regular users in sharing their stories."
    },
    {
      question: "How do I interact with stories and posts?",
      answer: "You can interact with content by leaving comments, sharing your thoughts and experiences, and offering help on assistance requests. When someone has posted a help request story, you can contact them directly through the contact information provided if you wish to offer support or assistance."
    },
    {
      question: "Is there a fee to use this platform?",
      answer: "No, our platform is completely free to use. You can read posts, comment, interact with the community, and request or offer help at no cost. We're committed to maintaining an accessible space for everyone to connect, share knowledge, and support each other without financial barriers."
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
            Find answers to common questions about our community platform, publishing, and interacting with content.
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