import flowbite from "flowbite-react/tailwind";
import tailwindScrollbar from "tailwind-scrollbar";


/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    flowbite.content(),
  ],
  theme: {
    extend: {
      keyframes: {
        'pulse-slow': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.8 },
        }
      },
      animation: {
        'pulse-slow': 'pulse-slow 3s ease-in-out infinite',
      }
    },
  },
  plugins: [
    flowbite.plugin(),
    tailwindScrollbar,
    
  ],
}