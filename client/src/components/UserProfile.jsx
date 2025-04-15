import { useEffect, useState, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { Button, Alert, Spinner } from "flowbite-react";
import UserPosts from "./UserPosts";

export default function UserProfile() {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Cache user data for performance
  const cacheKey = useMemo(() => `user_${username}`, [username]);
  
  // Use localStorage for cache persistence
  useEffect(() => {
    // Try to load cached user data
    const cachedUserData = localStorage.getItem(cacheKey);
    if (cachedUserData) {
      try {
        const parsedData = JSON.parse(cachedUserData);
        // Check if the cache is less than 5 minutes old
        if (Date.now() - parsedData.timestamp < 5 * 60 * 1000) {
          setUser(parsedData.userData);
          setLoading(false);
        }
      } catch (e) {
        console.error("Error parsing cached user data:", e);
      }
    }
  }, [cacheKey]);

  useEffect(() => {
    const fetchUser = async () => {
      if (!username) return;
      
      if (!loading) return; 
      
      try {
        setError(null);
        const res = await fetch(`/api/user/username/${username}`);
        const data = await res.json();
        
        if (!res.ok) {
          setError(data.message || "Failed to fetch user profile");
          return;
        }
        
        setUser(data);
        
        // Cache the user data with timestamp
        localStorage.setItem(cacheKey, JSON.stringify({
          userData: data,
          timestamp: Date.now()
        }));
      } catch (err) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [username, cacheKey, loading]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto p-3 w-full">
        <Alert color="failure" className="my-7">
          {error}
        </Alert>
        <Button as={Link} to="/" className="w-full">
          Go Home
        </Button>
      </div>
    );
  }
  if (!user) {
    return (
      <div className="max-w-lg mx-auto p-3 w-full">
        <Alert color="failure" className="my-7">
          User not found
        </Alert>
        <Button as={Link} to="/" className="w-full">
          Go Home
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-3 w-full">
      <div className="flex flex-col items-center mb-8 pb-8 border-b dark:border-gray-700">
        {/* User info section*/}
        <div className="flex flex-col items-center text-center max-w-xl mx-auto">
          <div className="relative w-32 h-32 sm:w-40 sm:h-40 overflow-hidden rounded-full shadow-md mb-4">
            <img 
              src={user.profilePicture} 
              alt={user.username} 
              className="rounded-full w-full h-full object-cover border-2 border-purple-700" 
              loading="lazy"
            />
          </div>
          <h1 className="text-3xl font-bold mb-2">{user.username}</h1>
          {(user.isAdmin || user.isPublisher) && (
            <div className="flex flex-wrap gap-2 justify-center mt-1 mb-3">
              {user.isAdmin && (
                <span className="px-4 py-1 text-sm bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 rounded-full">
                  Admin
                </span>
              )}
              {user.isPublisher && (
                <span className="px-4 py-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-full">
                  Publisher
                </span>
              )}
            </div>
          )}
          <p className="text-gray-600 dark:text-gray-400">
            Member since {new Date(user.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
      {/* User's posts section */}
      {user && <UserPosts userId={user._id} username={user.username} />}
    </div>
  );
} 