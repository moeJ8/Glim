import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button, Table, Spinner, Alert, Badge } from "flowbite-react";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { FaCheck, FaTimes } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { decrementPendingRequests } from "../redux/request/requestSlice";
import { updateSuccess } from "../redux/user/userSlice";
import CustomModal from "./CustomModal";

export default function DashRequests() {
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  
  // Common states
  const [activeTab, setActiveTab] = useState("publisher");
  const [showModal, setShowModal] = useState(false);
  
  // Publisher requests states
  const [publisherRequests, setPublisherRequests] = useState([]);
  const [showMorePublisher, setShowMorePublisher] = useState(true);
  const [loadingPublisher, setLoadingPublisher] = useState(true);
  const [requestToHandle, setRequestToHandle] = useState(null);
  const [actionType, setActionType] = useState("");
  
  // Story requests states
  const [pendingStories, setPendingStories] = useState([]);
  const [showMoreStories, setShowMoreStories] = useState(true);
  const [loadingStories, setLoadingStories] = useState(true);
  const [errorStories, setErrorStories] = useState(null);
  const [storyToAction, setStoryToAction] = useState(null);
  const [storyActionType, setStoryActionType] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  
  // User data cache
  const [usernames, setUsernames] = useState({});
  const [userProfiles, setUserProfiles] = useState({});
  
  // Statistics
  const [pendingPublisherCount, setPendingPublisherCount] = useState(0);
  const [pendingStoriesCount, setPendingStoriesCount] = useState(0);

  // Fetch publisher requests
  useEffect(() => {
    const fetchPublisherRequests = async () => {
      setLoadingPublisher(true);
      try {
        const res = await fetch(`/api/user/publisher-requests/get?status=pending`, {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
        });
        const data = await res.json();
        if (res.ok) {
          setPublisherRequests(data.requests);
          setPendingPublisherCount(data.totalRequests || data.requests.length);
          if (data.requests.length < 9) {
            setShowMorePublisher(false);
          }
        }
      } catch (error) {
        console.log(error.message);
      } finally {
        setLoadingPublisher(false);
      }
    };
    
    if (currentUser && currentUser.isAdmin) {
      fetchPublisherRequests();
    }
  }, [currentUser]);

  // Fetch pending stories
  useEffect(() => {
    const fetchPendingStories = async () => {
      try {
        setLoadingStories(true);
        const res = await fetch('/api/story/pending', {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
        });
        const data = await res.json();
        
        if (res.ok) {
          setPendingStories(data.stories);
          setPendingStoriesCount(data.totalPendingStories || data.stories.length);
          if (data.stories.length < 9) {
            setShowMoreStories(false);
          }
          
          // Collect unique user IDs to fetch usernames
          const userIds = [...new Set(data.stories.map(story => story.userId))];
          fetchUsernames(userIds);
        } else {
          setErrorStories(data.message);
        }
      } catch (error) {
        setErrorStories('Failed to fetch pending stories');
        console.error(error);
      } finally {
        setLoadingStories(false);
      }
    };
    
    if (currentUser && currentUser.isAdmin) {
      fetchPendingStories();
    }
  }, [currentUser]);
  
  // Fetch usernames for story authors
  const fetchUsernames = async (userIds) => {
    try {
      const promises = userIds.map(async (userId) => {
        // Skip if we already have this username cached
        if (usernames[userId] && userProfiles[userId]) {
          return { 
            userId, 
            username: usernames[userId],
            profilePicture: userProfiles[userId]
          };
        }
        
        const res = await fetch(`/api/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
        });
        
        if (res.ok) {
          const userData = await res.json();
          return { 
            userId, 
            username: userData.username,
            profilePicture: userData.profilePicture 
          };
        }
        return { 
          userId, 
          username: "Unknown User",
          profilePicture: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
        };
      });
      
      const results = await Promise.all(promises);
      
      // Update usernames and profiles state with new data
      const newUsernames = {};
      const newUserProfiles = {};
      
      results.forEach(result => {
        newUsernames[result.userId] = result.username;
        newUserProfiles[result.userId] = result.profilePicture;
      });
      
      setUsernames(prev => ({ ...prev, ...newUsernames }));
      setUserProfiles(prev => ({ ...prev, ...newUserProfiles }));
      
      // Update the pendingStories with user profile pictures
      setPendingStories(prev => 
        prev.map(story => ({
          ...story,
          userProfilePicture: newUserProfiles[story.userId] || userProfiles[story.userId]
        }))
      );
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  // Publisher requests - Load more
  const handleShowMorePublisher = async () => {
    const startIndex = publisherRequests.length;
    try {
      const res = await fetch(`/api/user/publisher-requests/get?startIndex=${startIndex}`, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setPublisherRequests((prev) => [...prev, ...data.requests]);
        if (data.requests.length < 9) {
          setShowMorePublisher(false);
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  // Pending stories - Load more
  const handleShowMoreStories = async () => {
    const startIndex = pendingStories.length;
    try {
      const res = await fetch(`/api/story/pending?startIndex=${startIndex}`, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
        },
      });
      const data = await res.json();
      
      if (res.ok) {
        setPendingStories([...pendingStories, ...data.stories]);
        if (data.stories.length < 9) {
          setShowMoreStories(false);
        }
        
        // Fetch usernames for new stories if needed
        const userIds = [...new Set(data.stories.map(story => story.userId))];
        fetchUsernames(userIds);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Publisher request - Handle action
  const handlePublisherAction = (request, action) => {
    setRequestToHandle(request);
    setActionType(action);
    setShowModal(true);
  };

  // Publisher request - Confirm action
  const handleConfirmPublisherAction = async () => {
    try {
      setActionLoading(true);
      const res = await fetch("/api/user/publisher-requests/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentUser.token}`,
        },
        body: JSON.stringify({
          requestId: requestToHandle._id,
          status: actionType,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setPublisherRequests((prev) => 
          prev.filter((request) => request._id !== requestToHandle._id)
        );
        setPendingPublisherCount(prev => prev - 1);
        dispatch(decrementPendingRequests());
        setShowModal(false);
        
        // Refresh user data to get updated permissions
        const userRes = await fetch(`/api/user/${currentUser._id}`);
        if (userRes.ok) {
          const userData = await userRes.json();
          dispatch(updateSuccess(userData));
        }
      } else {
        console.log(data.message);
      }
    } catch (error) {
      console.log(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Story - Handle action
  const openStoryActionModal = (story, action) => {
    setStoryToAction(story);
    setStoryActionType(action);
    setShowModal(true);
  };

  // Story - Confirm action
  const handleStoryAction = async () => {
    try {
      setActionLoading(true);
      
      const res = await fetch(`/api/story/status/${storyToAction._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: storyActionType === 'approve' ? 'approved' : 'rejected'
        })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setPendingStories(pendingStories.filter(story => story._id !== storyToAction._id));
        setPendingStoriesCount(prev => prev - 1);
        setShowModal(false);
        
        // Refresh user data to ensure permissions are up to date
        const userRes = await fetch(`/api/user/${currentUser._id}`);
        if (userRes.ok) {
          const userData = await userRes.json();
          dispatch(updateSuccess(userData));
        }
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setActionLoading(false);
    }
  };

  // Render publisher requests content
  const renderPublisherContent = () => {
    if (loadingPublisher) {
      return (
        <div className="flex justify-center items-center min-h-[40vh]">
          <div className="text-center">
            <Spinner size="xl" className="mx-auto" />
            <p className="mt-2 text-gray-500 dark:text-gray-400">Loading publisher requests...</p>
          </div>
        </div>
      );
    }

    if (publisherRequests.length === 0) {
      return (
        <div className="bg-gray-50 dark:bg-gray-800 p-4 sm:p-8 rounded-lg shadow-sm text-center">
          <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 mb-3 sm:mb-4 flex items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20">
            <HiOutlineExclamationCircle className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 dark:text-blue-400" />
          </div>
          <h3 className="text-base sm:text-lg font-medium mb-1">No Publisher Requests</h3>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
            There are no pending publisher requests at this time.
          </p>
        </div>
      );
    }

    return (
      <>
        <div className="hidden md:block">
          <Table hoverable className="shadow-md">
            <Table.Head>
              <Table.HeadCell>Date</Table.HeadCell>
              <Table.HeadCell>User Image</Table.HeadCell>
              <Table.HeadCell>Username</Table.HeadCell>
              <Table.HeadCell>Email</Table.HeadCell>
              <Table.HeadCell>Reason</Table.HeadCell>
              <Table.HeadCell>Actions</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {publisherRequests.map((request) => (
                <Table.Row
                  key={request._id}
                  className="bg-white dark:border-gray-700 dark:bg-gray-800"
                >
                  <Table.Cell>
                    {new Date(request.createdAt).toLocaleDateString()}
                  </Table.Cell>
                  <Table.Cell>
                    <img
                      src={request.userId.profilePicture}
                      alt={request.userId.username}
                      className="w-10 h-10 rounded-full bg-gray-500"
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <Link 
                      to={`/profile/${request.userId.username}`}
                      className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-500 dark:hover:text-blue-400 hover:underline"
                    >
                      {request.userId.username}
                    </Link>
                  </Table.Cell>
                  <Table.Cell>{request.userId.email}</Table.Cell>
                  <Table.Cell className="max-w-[200px]">
                    <p className="line-clamp-2 hover:line-clamp-none cursor-pointer transition-all">
                      {request.reason || "No reason provided"}
                    </p>
                  </Table.Cell>
                  <Table.Cell className="flex flex-wrap gap-2">
                    <Button
                    outline
                      size="sm"
                      color="success"
                      className="font-medium bg-gradient-to-r from-green-500 to-teal-500"
                      onClick={() => handlePublisherAction(request, "approved")}
                    >
                      <FaCheck className="mr-2 mt-1" />
                      Approve
                    </Button>
                    <Button
                    outline
                      size="sm"
                      color="failure"
                      className="font-medium bg-gradient-to-r from-red-500 to-pink-500"
                      onClick={() => handlePublisherAction(request, "rejected")}
                    >
                      <FaTimes className="mr-2 mt-1" />
                      Reject
                    </Button>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
          {showMorePublisher && (
            <div className="flex justify-center mt-5 hidden md:flex">
              <div className="flex gap-2 bg-gray-50 dark:bg-gray-800 p-2 rounded-lg shadow-sm">
                <Button
                  onClick={handleShowMorePublisher}
                  color="purple"
                  className="bg-gradient-to-r from-purple-500 to-pink-500"
                >
                  Show More
                </Button>
              </div>
            </div>
          )}
        </div>
      </>
    );
  };

  // Render publisher requests as cards for mobile
  const renderPublisherRequestCards = () => {
    return (
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {publisherRequests.map((request) => (
          <div key={request._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <div className="flex items-center gap-3 mb-3">
              <img
                src={request.userId.profilePicture}
                alt={request.userId.username}
                className="w-12 h-12 rounded-full bg-gray-500"
              />
              <div>
                <Link 
                  to={`/profile/${request.userId.username}`}
                  className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-500 dark:hover:text-blue-400 hover:underline"
                >
                  {request.userId.username}
                </Link>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(request.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="mb-3">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Email:</p>
              <p className="text-gray-800 dark:text-gray-200">{request.userId.email}</p>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Reason:</p>
              <p className="text-gray-800 dark:text-gray-200">
                {request.reason || "No reason provided"}
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button
                outline
                size="sm"
                color="success"
                className="font-medium bg-gradient-to-r from-green-500 to-teal-500 flex-1"
                onClick={() => handlePublisherAction(request, "approved")}
              >
                <FaCheck className="mr-2" />
                Approve
              </Button>
              <Button
                outline
                size="sm"
                color="failure"
                className="font-medium bg-gradient-to-r from-red-500 to-pink-500 flex-1"
                onClick={() => handlePublisherAction(request, "rejected")}
              >
                <FaTimes className="mr-2" />
                Reject
              </Button>
            </div>
          </div>
        ))}
        
        {showMorePublisher && (
          <div className="flex justify-center mt-4">
            <Button
              onClick={handleShowMorePublisher}
              color="purple"
              className="bg-gradient-to-r from-purple-500 to-pink-500"
            >
              Show More
            </Button>
          </div>
        )}
      </div>
    );
  };

  // Render pending stories content
  const renderStoriesContent = () => {
    if (loadingStories) {
      return (
        <div className="flex justify-center items-center min-h-[40vh]">
          <div className="text-center">
            <Spinner size="xl" className="mx-auto" />
            <p className="mt-2 text-gray-500 dark:text-gray-400">Loading story requests...</p>
          </div>
        </div>
      );
    }

    if (errorStories) {
      return (
        <Alert color="failure" className="my-3 sm:my-5 border-l-4 border-red-500 text-sm sm:text-base">
          <span>{errorStories}</span>
        </Alert>
      );
    }

    if (pendingStories.length === 0) {
      return (
        <div className="bg-gray-50 dark:bg-gray-800 p-4 sm:p-8 rounded-lg shadow-sm text-center">
          <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 mb-3 sm:mb-4 flex items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20">
            <HiOutlineExclamationCircle className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 dark:text-blue-400" />
          </div>
          <h3 className="text-base sm:text-lg font-medium mb-1">No Pending Stories</h3>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
            All stories have been reviewed.
          </p>
        </div>
      );
    }

    return (
      <>
        <div className="hidden md:block">
          <Table hoverable className="shadow-md">
            <Table.Head>
              <Table.HeadCell>Date</Table.HeadCell>
              <Table.HeadCell>User Image</Table.HeadCell>
              <Table.HeadCell>Username</Table.HeadCell>
              <Table.HeadCell>Title</Table.HeadCell>
              <Table.HeadCell>Category</Table.HeadCell>
              <Table.HeadCell>Country</Table.HeadCell>
              <Table.HeadCell>Actions</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {pendingStories.map((story) => (
                <Table.Row
                  key={story._id}
                  className="bg-white dark:border-gray-700 dark:bg-gray-800"
                >
                  <Table.Cell className="whitespace-nowrap">
                    {new Date(story.createdAt).toLocaleDateString()}
                  </Table.Cell>
                  <Table.Cell>
                    <img
                      src={userProfiles[story.userId] || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"}
                      alt={usernames[story.userId] || "User"}
                      className="w-10 h-10 rounded-full bg-gray-500"
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <Link 
                      to={usernames[story.userId] ? `/profile/${usernames[story.userId]}` : '#'}
                      className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-500 dark:hover:text-blue-400 hover:underline"
                    >
                      {usernames[story.userId] || "Loading..."}
                    </Link>
                  </Table.Cell>
                  <Table.Cell className="max-w-[200px]">
                    <div className="truncate">
                      <Link 
                        to={`/narrative/${story.slug}`}
                        className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-500 dark:hover:text-blue-400 hover:underline"
                      >
                        {story.title}
                      </Link>
                    </div>
                  </Table.Cell>
                  <Table.Cell>{story.category}</Table.Cell>
                  <Table.Cell>{story.country}</Table.Cell>
                  <Table.Cell className="flex items-center gap-2">
                    <div className="flex items-center text-sm space-x-2">
                      {story.status === 'approved' && (
                        <Link to={`/narrative/${story.slug}`}>
                          <Button size="xs" color="teal" className="px-2 py-1">
                            View 
                          </Button>
                        </Link>
                      )}
                    </div>
                    <Button
                    outline
                      size="sm"
                      color="success"
                      className="font-medium bg-gradient-to-r from-green-500 to-teal-500"
                      onClick={() => openStoryActionModal(story, 'approve')}
                    >
                      <FaCheck className="mr-2 mt-1" />
                      Approve
                    </Button>
                    <Button
                    outline
                      size="sm"
                      color="failure"
                      className="font-medium bg-gradient-to-r from-red-500 to-pink-500"
                      onClick={() => openStoryActionModal(story, 'reject')}
                    >
                      <FaTimes className="mr-2 mt-1" />
                      Reject
                    </Button>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
          
          {showMoreStories && (
            <div className="flex justify-center mt-5 hidden md:flex">
              <div className="flex gap-2 bg-gray-50 dark:bg-gray-800 p-2 rounded-lg shadow-sm">
                <Button
                  onClick={handleShowMoreStories}
                  color="purple"
                  className="bg-gradient-to-r from-purple-500 to-pink-500"
                >
                  Show More
                </Button>
              </div>
            </div>
          )}
        </div>
      </>
    );
  };

  // Render story requests as cards for mobile
  const renderStoryRequestCards = () => {
    return (
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {pendingStories.map((story) => (
          <div key={story._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <div className="flex items-center gap-3 mb-3">
              <img
                src={userProfiles[story.userId] || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"}
                alt={usernames[story.userId] || "User"}
                className="w-12 h-12 rounded-full bg-gray-500"
              />
              <div>
                <Link 
                  to={usernames[story.userId] ? `/profile/${usernames[story.userId]}` : '#'}
                  className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-500 dark:hover:text-blue-400 hover:underline"
                >
                  {usernames[story.userId] || "Loading..."}
                </Link>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(story.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="mb-3">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Title:</p>
              <Link 
                to={`/narrative/${story.slug}`}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-500 dark:hover:text-blue-400 hover:underline font-medium"
              >
                {story.title}
              </Link>
            </div>
            
            <div className="flex mb-4">
              <div className="mr-6">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Category:</p>
                <p className="text-gray-800 dark:text-gray-200">{story.category}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Country:</p>
                <p className="text-gray-800 dark:text-gray-200">{story.country}</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                outline
                size="sm"
                color="success"
                className="font-medium bg-gradient-to-r from-green-500 to-teal-500 flex-1"
                onClick={() => openStoryActionModal(story, 'approve')}
              >
                <FaCheck className="mr-2" />
                Approve
              </Button>
              <Button
                outline
                size="sm"
                color="failure"
                className="font-medium bg-gradient-to-r from-red-500 to-pink-500 flex-1"
                onClick={() => openStoryActionModal(story, 'reject')}
              >
                <FaTimes className="mr-2" />
                Reject
              </Button>
            </div>
          </div>
        ))}
        
        {showMoreStories && (
          <div className="flex justify-center mt-4">
            <Button
              onClick={handleShowMoreStories}
              color="purple"
              className="bg-gradient-to-r from-purple-500 to-pink-500"
            >
              Show More
            </Button>
          </div>
        )}
      </div>
    );
  };

  const renderModalContent = () => {
    if (activeTab === "publisher" && requestToHandle) {
      return (
        <div className="text-center">
          <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-red-600 dark:text-gray-200" />
          <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
            {actionType === "approved"
              ? "Are you sure you want to approve this publisher request?"
              : "Are you sure you want to reject this publisher request?"}
          </h3>
          
          {/* User info */}
          <div className="mb-4 flex justify-center items-center">
            <img
              src={requestToHandle.userId.profilePicture}
              alt={requestToHandle.userId.username}
              className="w-10 h-10 rounded-full bg-gray-500 mr-3"
            />
            <Link 
              to={`/profile/${requestToHandle.userId.username}`}
              className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-500 dark:hover:text-blue-400 hover:underline"
            >
              {requestToHandle.userId.username}
            </Link>
          </div>
          
          {requestToHandle.reason && (
            <div className="mb-5 max-w-md mx-auto">
              <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">User&apos;s reason:</p>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-left text-gray-600 dark:text-gray-400 text-sm">
                {requestToHandle.reason}
              </div>
            </div>
          )}
        </div>
      );
    } else if (activeTab === "stories" && storyToAction) {
      return (
        <div className="text-center">
          <HiOutlineExclamationCircle className="h-14 w-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto" />
          <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
            {storyActionType === 'approve'
              ? 'Are you sure you want to approve this narrative?'
              : 'Are you sure you want to reject this narrative?'}
          </h3>
          
          {/* User info with profile pic and username */}
          <div className="mb-4 flex justify-center items-center">
            <img
              src={userProfiles[storyToAction.userId] || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'}
              alt={usernames[storyToAction.userId] || "User"}
              className="w-10 h-10 rounded-full bg-gray-500 mr-3"
            />
            <Link 
              to={usernames[storyToAction.userId] ? `/profile/${usernames[storyToAction.userId]}` : '#'}
              className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-500 dark:hover:text-blue-400 hover:underline"
            >
              {usernames[storyToAction.userId] || "Loading..."}
            </Link>
          </div>
          
          {/* Narrative title */}
          <div className="mb-4 max-w-md mx-auto">
            <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">Narrative title:</p>
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-gray-600 dark:text-gray-400">
              <Link 
                to={`/narrative/${storyToAction.slug}`}
                className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-500 dark:hover:text-blue-400 hover:underline"
              >
                {storyToAction.title}
              </Link>
            </div>
          </div>
        </div>
      );
    }
    
    return null;
  };

  const renderModalFooter = () => {
    if (activeTab === "publisher" && requestToHandle) {
      return (
        <div className="flex justify-center gap-4 w-full">
          <Button 
            color="success" 
            onClick={handleConfirmPublisherAction}
            disabled={actionLoading}
            className="bg-gradient-to-r from-green-500 to-teal-500"
          >
            {actionLoading ? (
              <>
                <Spinner size="sm" className="mr-2" />
                <span>Processing...</span>
              </>
            ) : (
              "Yes, I'm sure"
            )}
          </Button>
          <Button 
            color="failure" 
            onClick={() => setShowModal(false)} 
            disabled={actionLoading}
            className="bg-gradient-to-r from-red-500 to-pink-500"
          >
            No, cancel
          </Button>
        </div>
      );
    } else if (activeTab === "stories" && storyToAction) {
      return (
        <div className="flex justify-center gap-4 w-full">
          <Button
            color="success"
            onClick={handleStoryAction}
            disabled={actionLoading}
            className="bg-gradient-to-r from-green-500 to-teal-500"
          >
            {actionLoading ? (
              <>
                <Spinner size="sm" className="mr-2" />
                <span>Processing...</span>
              </>
            ) : (
              `Yes, ${storyActionType} it`
            )}
          </Button>
          <Button
            color="failure"
            onClick={() => setShowModal(false)}
            disabled={actionLoading}
            className="bg-gradient-to-r from-red-500 to-pink-500"
          >
            Cancel
          </Button>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="table-auto overflow-x-scroll md:mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500">
      <h1 className="text-center text-2xl sm:text-3xl my-4 sm:my-5 font-bold text-gray-800 dark:text-gray-100">
        Manage Requests
      </h1>
      
      {/* Custom tabs implementation */}
      <div className="mb-4 sm:mb-6 border-b border-gray-200 dark:border-gray-700">
        <ul className="flex flex-wrap -mb-px text-xs sm:text-sm font-medium text-center justify-center">
          <li className="mr-1 sm:mr-2">
            <button
              className={`inline-block p-2 sm:p-4 rounded-t-lg border-b-2 ${
                activeTab === "publisher" 
                  ? "text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500" 
                  : "border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
              }`}
              onClick={() => {
                setActiveTab("publisher");
                setShowModal(false);
              }}
              type="button"
            >
              <div className="flex items-center gap-1 sm:gap-2">
                <span>Publisher Requests</span>
                {pendingPublisherCount > 0 && (
                  <Badge color="failure" className="ml-1">
                    {pendingPublisherCount}
                  </Badge>
                )}
              </div>
            </button>
          </li>
          <li className="mr-1 sm:mr-2">
            <button
              className={`inline-block p-2 sm:p-4 rounded-t-lg border-b-2 ${
                activeTab === "stories" 
                  ? "text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500" 
                  : "border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
              }`}
              onClick={() => {
                setActiveTab("stories");
                setShowModal(false);
              }}
              type="button"
            >
              <div className="flex items-center gap-1 sm:gap-2">
                <span>Narrative Approvals</span>
                {pendingStoriesCount > 0 && (
                  <Badge color="failure" className="ml-1">
                    {pendingStoriesCount}
                  </Badge>
                )}
              </div>
            </button>
          </li>
        </ul>
      </div>
      
      {activeTab === "publisher" && renderPublisherContent()}
      {activeTab === "publisher" && renderPublisherRequestCards()}
      {activeTab === "stories" && renderStoriesContent()}
      {activeTab === "stories" && renderStoryRequestCards()}
      
      <CustomModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={activeTab === "publisher" 
          ? (actionType === "approved" ? "Approve Publisher Request" : "Reject Publisher Request")
          : (storyActionType === "approve" ? "Approve Narrative" : "Reject Narrative")
        }
        maxWidth="md"
        footer={renderModalFooter()}
      >
        {renderModalContent()}
      </CustomModal>
    </div>
  );
} 