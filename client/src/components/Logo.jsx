import { Link } from 'react-router-dom';

export default function Logo() {
  return (
    <Link to="/" className="self-center whitespace-nowrap">
      <span className="text-gray-400 dark:text-gray-300 
        hover:text-gray-500 dark:hover:text-gray-200 
        transition-all duration-300
        animate-pulse-slow
        text-2xl sm:text-4xl md:text-3xl
        font-sans font-extrabold
        tracking-tight">
        Glim
      </span>
    </Link>
  );
} 