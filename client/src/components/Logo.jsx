import { Link } from 'react-router-dom';

export default function Logo() {
  return (
    <Link to="/" className="self-center whitespace-nowrap">
      <span className="text-gray-600
        dark:text-gray-200
        hover:text-gray-700
        dark:hover:text-white
        transition-all duration-300
        text-3xl sm:text-5xl md:text-4xl
        font-sans font-extrabold
        tracking-tight
        drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]">
        Glim
      </span>
    </Link>
  );
} 