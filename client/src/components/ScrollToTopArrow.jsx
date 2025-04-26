import { useState, useEffect } from 'react';
import { HiArrowUp } from 'react-icons/hi';

export default function ScrollToTopArrow() {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled down
  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Set the top scroll button functionality
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  return (
    <div className="fixed bottom-8 right-8 z-50 hidden md:block">
      {isVisible && (
        <button
          onClick={scrollToTop}
          aria-label="Scroll to top"
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:bg-gradient-to-l text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 flex items-center justify-center"
        >
          <HiArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
} 