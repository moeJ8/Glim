const CallToActionDonate = () => {
  return (
    <div className="bg-red-500 dark:bg-red-700 rounded-lg p-6 sm:p-8 md:p-12 mt-4 sm:mt-6 md:mt-8 text-white relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute top-0 right-0 w-24 sm:w-28 md:w-32 h-24 sm:h-28 md:h-32 bg-red-400 rounded-full opacity-20 transform translate-x-12 sm:translate-x-16 -translate-y-12 sm:-translate-y-16"></div>
      <div className="absolute bottom-0 left-0 w-16 sm:w-20 md:w-24 h-16 sm:h-20 md:h-24 bg-red-400 rounded-full opacity-20 transform -translate-x-6 sm:-translate-x-8 translate-y-6 sm:translate-y-8"></div>
      
      <div className="relative z-10">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3 md:mb-4">
          Become a champion for this cause today
        </h2>
        <button className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-full font-semibold mt-8 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm sm:text-base md:text-lg mx-auto block">
          Donate now
        </button>
      </div>
    </div>
  )
}

export default CallToActionDonate 