import { Button } from 'flowbite-react';
import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <div className="bg-slate-50 dark:bg-slate-800 text-gray-900 dark:text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-1">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
              Share Your Story, Make an Impact.
              <br className="hidden sm:block" />
              
            </h1>
            <p className="text-base sm:text-lg mb-6 sm:mb-8 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto lg:mx-0">
              Join our diverse community where every voice matters. Whether you&apos;re passionate about art,
              supporting causes, sharing knowledge, or making a difference - this is your platform to
              connect, inspire, and create meaningful change.
            </p>
            <div className="flex justify-center lg:justify-start">
              <Button gradientDuoTone='purpleToBlue' outline size="md" className="w-[200px] lg:w-auto">
                <Link
                    to="/donate"
                    className="w-full"
                >
                    Donate Now
                </Link>
              </Button>
            </div>
          </div>
          <div className="hidden lg:block flex-1 w-full max-w-lg">
            <img
            loading="eager"
              src="https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Modern creative workspace"
              className="w-full h-[500px] object-cover rounded-lg shadow-lg mx-auto transition-transform duration-300 brightness-[0.95] contrast-[1.05]"
            />
          </div>
        </div>
      </div>
    </div>
  );
} 