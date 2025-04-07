import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button, Spinner } from "flowbite-react";

export default function Donate() {
  const [donationCases, setDonationCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    const fetchDonationCases = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/donation/cases?limit=6`);
        if (!res.ok) {
          throw new Error("Failed to fetch donation cases");
        }
        const data = await res.json();
        setDonationCases(data.donationCases);
        setLoading(false);
        if (data.donationCases.length === 6) {
          setShowMore(true);
        }
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchDonationCases();
  }, []);

  const handleShowMore = async () => {
    const startIndex = donationCases.length;
    try {
      const res = await fetch(`/api/donation/cases?startIndex=${startIndex}&limit=6`);
      if (!res.ok) {
        throw new Error("Failed to load more cases");
      }
      const data = await res.json();
      setDonationCases([...donationCases, ...data.donationCases]);
      if (data.donationCases.length < 6) {
        setShowMore(false);
      }
    } catch (error) {
      setError(error.message);
    }
  };

  // Format amount with commas and two decimal places
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Calculate progress percentage
  const getProgressPercentage = (raised, goal) => {
    if (!goal) return 0;
    const percentage = (raised / goal) * 100;
    return Math.min(percentage, 100).toFixed(0);
  };

  return (
    <div className="min-h-screen max-w-6xl mx-auto px-3 py-8">
      <div className="flex flex-col gap-6 mb-8">
        <h1 className="text-3xl font-semibold text-center">Donation Cases</h1>
        <p className="text-gray-500 dark:text-gray-400 text-center max-w-2xl mx-auto">
          Your generous donation helps empower women and create lasting change for equality. 
          Choose a cause below to support our mission.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-[300px]">
          <Spinner size="xl" />
        </div>
      ) : error ? (
        <div className="text-center text-red-500">
          <p>{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Try Again
          </Button>
        </div>
      ) : donationCases.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 min-h-[300px] flex flex-col items-center justify-center">
          <p className="mb-4">No active donation cases at the moment.</p>
          <p>Please check back later or contact us for more information.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {donationCases.map((donationCase) => (
              <div
                key={donationCase._id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow flex flex-col h-full"
              >
                {donationCase.image && (
                  <img
                    src={donationCase.image}
                    alt={donationCase.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4 flex flex-col flex-grow">
                  <h2 className="text-xl font-semibold mb-2 line-clamp-1">
                    {donationCase.title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 flex-grow">
                    {donationCase.description}
                  </p>
                  
                  {donationCase.goalAmount && (
                    <div className="mb-4">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          {formatAmount(donationCase.raisedAmount)} raised
                        </span>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Goal: {formatAmount(donationCase.goalAmount)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full"
                          style={{ width: `${getProgressPercentage(donationCase.raisedAmount, donationCase.goalAmount)}%` }}
                        ></div>
                      </div>
                      <div className="mt-1 text-xs text-right text-gray-500 dark:text-gray-400">
                        {getProgressPercentage(donationCase.raisedAmount, donationCase.goalAmount)}% of goal
                      </div>
                    </div>
                  )}
                  
                  <Link to={`/donate/${donationCase._id}`} className="mt-auto">
                    <Button
                      gradientDuoTone="purpleToBlue"
                      outline
                      className="w-full"
                    >
                      Donate Now
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {showMore && (
            <div className="text-center mt-8">
              <Button
                onClick={handleShowMore}
                outline
                gradientDuoTone="purpleToBlue"
              >
                Show More
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
} 