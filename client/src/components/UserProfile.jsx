import { useEffect, useState, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { Button, Alert, Spinner } from "flowbite-react";
import UserPosts from "./UserPosts";
import { useSelector } from "react-redux";
import UserListModal from "./UserListModal";

export default function UserProfile() {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loadingFollowers, setLoadingFollowers] = useState(false);
  const [loadingFollowing, setLoadingFollowing] = useState(false);
  
  const { currentUser } = useSelector(state => state.user);
  
  // Cache user data
  const cacheKey = useMemo(() => `user_${username}`, [username]);
  
  // localStorage for cache persistence
  useEffect(() => {
    // Try to load cached user data
    const cachedUserData = localStorage.getItem(cacheKey);
    if (cachedUserData) {
      try {
        const parsedData = JSON.parse(cachedUserData);
        // 5 minutes old
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
  
  // Check if the current user is following this profile and get follower counts
  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!user || !currentUser) return;
      
      try {
        // Check if user's followers array includes currentUser id
        if (user.followers && user.followers.includes(currentUser._id)) {
          setIsFollowing(true);
        }
        
        // Set follower and following counts
        setFollowersCount(user.followers ? user.followers.length : 0);
        setFollowingCount(user.following ? user.following.length : 0);
      } catch (err) {
        console.error("Error checking follow status:", err);
      }
    };
    
    checkFollowStatus();
  }, [user, currentUser]);
  
  const handleFollow = async () => {
    if (!currentUser) {
      // Redirect to sign in if not logged in
      window.location.href = "/sign-in";
      return;
    }
    
    if (!user || followLoading) return;
    
    setFollowLoading(true);
    
    try {
      const res = await fetch(`/api/user/follow/${user._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        console.error(data.message);
        return;
      }
      
      setIsFollowing(true);
      setFollowersCount(prev => prev + 1);
      
      // Update the user object with the new follower
      if (user.followers) {
        setUser({
          ...user,
          followers: [...user.followers, currentUser._id]
        });
      } else {
        setUser({
          ...user,
          followers: [currentUser._id]
        });
      }
    } catch (err) {
      console.error("Error following user:", err);
    } finally {
      setFollowLoading(false);
    }
  };
  
  const handleUnfollow = async () => {
    if (!currentUser || !user || followLoading) return;
    
    setFollowLoading(true);
    
    try {
      const res = await fetch(`/api/user/unfollow/${user._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        console.error(data.message);
        return;
      }
      
      setIsFollowing(false);
      setFollowersCount(prev => prev - 1);
      
      // Update the user object by removing the current user from followers
      if (user.followers) {
        setUser({
          ...user,
          followers: user.followers.filter(id => id !== currentUser._id)
        });
      }
    } catch (err) {
      console.error("Error unfollowing user:", err);
    } finally {
      setFollowLoading(false);
    }
  };
  
  const fetchFollowers = async () => {
    if (!user || loadingFollowers) return;
    
    setLoadingFollowers(true);
    
    try {
      const res = await fetch(`/api/user/${user._id}/followers`);
      const data = await res.json();
      
      if (!res.ok) {
        console.error("Failed to fetch followers");
        return;
      }
      
      setFollowers(data);
      setShowFollowersModal(true);
    } catch (err) {
      console.error("Error fetching followers:", err);
    } finally {
      setLoadingFollowers(false);
    }
  };
  
  const fetchFollowing = async () => {
    if (!user || loadingFollowing) return;
    
    setLoadingFollowing(true);
    
    try {
      const res = await fetch(`/api/user/${user._id}/following`);
      const data = await res.json();
      
      if (!res.ok) {
        console.error("Failed to fetch following");
        return;
      }
      
      setFollowing(data);
      setShowFollowingModal(true);
    } catch (err) {
      console.error("Error fetching following:", err);
    } finally {
      setLoadingFollowing(false);
    }
  };

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
          
          {/* Follow stats */}
          <div className="flex gap-6 mt-2 mb-3">
            <button 
              onClick={fetchFollowers}
              className="text-gray-600 dark:text-gray-400 hover:underline"
              disabled={loadingFollowers}
            >
              <span className="font-bold text-gray-800 dark:text-gray-200">{followersCount}</span> Followers
            </button>
            <button 
              onClick={fetchFollowing}
              className="text-gray-600 dark:text-gray-400 hover:underline"
              disabled={loadingFollowing}
            >
              <span className="font-bold text-gray-800 dark:text-gray-200">{followingCount}</span> Following
            </button>
          </div>
          
          {/* Follow/Unfollow button */}
          {(user.isAdmin || user.isPublisher) && currentUser && currentUser._id !== user._id && (
            <div className="mt-2">
              {isFollowing ? (
                <button 
                  onClick={handleUnfollow} 
                  disabled={followLoading}
                  className="bg-gradient-to-r from-pink-500 to-orange-400 text-white text-sm font-medium rounded-full px-6 py-2 transition-all hover:opacity-90 w-28"
                >
                  {followLoading ? <Spinner size="sm" /> : 'Unfollow'}
                </button>
              ) : (
                <button 
                  onClick={handleFollow}
                  disabled={followLoading}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium rounded-full px-6 py-2 transition-all hover:opacity-90 w-28"
                >
                  {followLoading ? <Spinner size="sm" /> : 'Follow'}
                </button>
              )}
            </div>
          )}
          
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Member since {new Date(user.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
      {/* User's posts section */}
      {user && <UserPosts userId={user._id} username={user.username} />}
      
      {/* Followers Modal */}
      <UserListModal
        isOpen={showFollowersModal}
        onClose={() => setShowFollowersModal(false)}
        title="Followers"
        users={followers}
        loading={loadingFollowers}
        emptyIcon="👥"
        emptyTitle="No followers yet"
        emptyMessage="When someone follows you, they&apos;ll appear here."
      />
      
      {/* Following Modal */}
      <UserListModal
        isOpen={showFollowingModal}
        onClose={() => setShowFollowingModal(false)}
        title="Following"
        users={following}
        loading={loadingFollowing}
        emptyIcon="👤"
        emptyTitle="Not following anyone yet"
        emptyMessage="When you follow someone, they&apos;ll appear here."
      />
    </div>
  );
} 