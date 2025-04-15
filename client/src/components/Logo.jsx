import { Link } from 'react-router-dom';

export default function Logo() {
  return (
    <Link to="/" className="self-center whitespace-nowrap">
      <span className="bg-gradient-to-r from-gray-300 via-gray-100 to-gray-300 
        dark:from-gray-400 dark:via-gray-200 dark:to-gray-400
        bg-clip-text text-transparent
        hover:from-gray-400 hover:via-white hover:to-gray-400
        transition-all duration-300
        text-3xl sm:text-5xl md:text-4xl
        font-sans font-extrabold
        tracking-tight
        drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]">
        Glim
      </span>
    </Link>
  );
} 