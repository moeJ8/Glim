import { Button } from 'flowbite-react';
import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <div className="bg-slate-50 dark:bg-slate-800 text-gray-900 dark:text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
              A Future built on Equality
              <br className="hidden sm:block" />
              And Women&apos;s Empowerment
            </h1>
            <p className="text-base sm:text-lg mb-6 sm:mb-8 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto lg:mx-0">
              Join us in the fight for a world where women&apos;s rights are
              recognized, respected, and upheld. Together, we can create
              lasting change, ensuring equality for all and empowering
              women to reach their full potential
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
              src="https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=500&auto=format&fit=crop&q=80"
              alt="Women Empowerment"
              className="w-full h-[500px] object-cover rounded-lg shadow-lg grayscale mx-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
} 