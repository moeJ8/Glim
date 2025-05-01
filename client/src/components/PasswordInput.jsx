import { useState } from 'react';
import { TextInput } from 'flowbite-react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function PasswordInput({ id, placeholder, onChange, className = '' }) {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="relative">
      <TextInput
        id={id}
        type={showPassword ? 'text' : 'password'}
        placeholder={placeholder || '••••••••'}
        onChange={onChange}
        className={`${className} w-full`}
      />
      <button
        type="button"
        className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer z-10 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        onClick={togglePasswordVisibility}
        tabIndex="-1" // Prevent tab focus
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? (
          <FaEyeSlash className="w-5 h-5" />
        ) : (
          <FaEye className="w-5 h-5" />
        )}
      </button>
    </div>
  );
} 