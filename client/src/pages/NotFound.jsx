import { Button } from 'flowbite-react';
import { Link } from 'react-router-dom';
import { FaHome, FaCompass, FaSadTear } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import './NotFound.css'; // We'll create this CSS file separately

export default function NotFound() {
  const [quote, setQuote] = useState('');
  
  const lonelinessQuotes = [
    "Looks like you are wandering in the void...",
    "Just you, the darkness, and a 404 error.",
    "This page is as empty as my social calendar.",
    "Hello? Is anybody out there?",
    "You've reached the edge of the internet.",
    "This is the digital equivalent of an empty room.",
    "It's quiet here. Too quiet.",
    "You've found the loneliest page on the internet.",
    "Even the pixels have abandoned this page.",
    "In a sea of content, you found the one empty island."
  ];
  
  useEffect(() => {
    const randomQuote = lonelinessQuotes[Math.floor(Math.random() * lonelinessQuotes.length)];
    setQuote(randomQuote);

    const stars = document.querySelectorAll('.star');
    stars.forEach(star => {
      const duration = 15 + Math.random() * 20;
      const delay = Math.random() * 10;
      star.style.animation = `float ${duration}s ease-in-out ${delay}s infinite`;
    });

    document.body.classList.add('hide-footer');

    return () => {
      document.body.classList.remove('hide-footer');
    };
  }, []);

  return (
    <div className="not-found-page flex flex-col items-center justify-center min-h-screen relative overflow-hidden bg-gray-900 text-white px-4">
      {/* Animated stars background */}
      {[...Array(50)].map((_, i) => (
        <div 
          key={i}
          className="star absolute h-1 w-1 bg-white rounded-full opacity-70"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            opacity: Math.random() * 0.8 + 0.2,
            height: `${Math.random() * 3 + 1}px`,
            width: `${Math.random() * 3 + 1}px`,
          }}
        />
      ))}
      
      {/* Large astronaut floating in space */}
      <div className="mb-8 text-center relative">
        <div className="animate-float-slow">
          <div className="text-9xl mb-4 mx-auto opacity-90">
            <FaSadTear className="text-blue-400 mx-auto" />
          </div>
          <div className="absolute -bottom-3 w-16 h-6 bg-black opacity-20 rounded-full mx-auto left-0 right-0 blur-sm"></div>
        </div>
      </div>
      
      {/* 404 Text */}
      <h1 className="text-8xl md:text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500 mb-4 tracking-wider">
        404
      </h1>
      
      {/* Message */}
      <div className="text-center max-w-md mb-8">
        <h2 className="text-2xl font-bold mb-2">You&apos;re All Alone In Here</h2>
        <p className="text-gray-400 mb-4">{quote}</p>
        <p className="text-gray-300">
          The page you&apos;re looking for has drifted into the digital void or never existed in the first place.
        </p>
      </div>
      
      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link to="/" className="w-full sm:w-auto">
          <Button gradientDuoTone="purpleToBlue" size="lg" className="px-6 w-full">
            <FaHome className="mr-2 mt-1" />
            Return Home
          </Button>
        </Link>
        <Link to="/categories" className="w-full sm:w-auto">
          <Button gradientDuoTone="purpleToPink" size="lg" className="px-6 w-full">
            <FaCompass className="mr-2 mt-1" />
            Explore Posts
          </Button>
        </Link>
      </div>
    </div>
  );
} 