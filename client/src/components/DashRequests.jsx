import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button, Table, Modal, Spinner, Alert, Badge } from "flowbite-react";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { FaCheck, FaTimes } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { decrementPendingRequests } from "../redux/request/requestSlice";
import { updateSuccess } from "../redux/user/userSlice";

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
        const res = await fetch('/api/story/pending');
        const data = await res.json();
        
        if (res.ok) {
          setPendingStories(data.stories);
          setPendingStoriesCount(data.totalPendingStories || data.stories.length);
          if (data.stories.length < 9) {
            setShowMoreStories(false);
          }
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
      const res = await fetch(`/api/story/pending?startIndex=${startIndex}`);
      const data = await res.json();
      
      if (res.ok) {
        setPendingStories([...pendingStories, ...data.stories]);
        if (data.stories.length < 9) {
          setShowMoreStories(false);
        }
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
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <Spinner size="xl" className="mx-auto" />
            <p className="mt-2 text-gray-500 dark:text-gray-400">Loading publisher requests...</p>
          </div>
        </div>
      );
    }

    if (publisherRequests.length === 0) {
      return (
        <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-lg shadow-sm text-center">
          <div className="mx-auto w-16 h-16 mb-4 flex items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20">
            <HiOutlineExclamationCircle className="w-8 h-8 text-blue-500 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-medium mb-1">No Publisher Requests</h3>
          <p className="text-gray-500 dark:text-gray-400">
            There are no pending publisher requests at this time.
          </p>
        </div>
      );
    }

    return (
      <>
        <Table hoverable className="shadow-md">
          <Table.Head>
            <Table.HeadCell>Date</Table.HeadCell>
            <Table.HeadCell>User Image</Table.HeadCell>
            <Table.HeadCell>Username</Table.HeadCell>
            <Table.HeadCell>Email</Table.HeadCell>
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
                <Table.Cell>{request.userId.username}</Table.Cell>
                <Table.Cell>{request.userId.email}</Table.Cell>
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
          <div className="flex justify-center mt-5">
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
      </>
    );
  };

  // Render pending stories content
  const renderStoriesContent = () => {
    if (loadingStories) {
      return (
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <Spinner size="xl" className="mx-auto" />
            <p className="mt-2 text-gray-500 dark:text-gray-400">Loading story requests...</p>
          </div>
        </div>
      );
    }

    if (errorStories) {
      return (
        <Alert color="failure" className="my-5 border-l-4 border-red-500">
          <span>{errorStories}</span>
        </Alert>
      );
    }

    if (pendingStories.length === 0) {
      return (
        <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-lg shadow-sm text-center">
          <div className="mx-auto w-16 h-16 mb-4 flex items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20">
            <HiOutlineExclamationCircle className="w-8 h-8 text-blue-500 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-medium mb-1">No Pending Stories</h3>
          <p className="text-gray-500 dark:text-gray-400">
            All stories have been reviewed.
          </p>
        </div>
      );
    }

    return (
      <>
        <Table hoverable className="shadow-md">
          <Table.Head>
            <Table.HeadCell>Date</Table.HeadCell>
            <Table.HeadCell>User</Table.HeadCell>
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
                <Table.Cell>{story.userId}</Table.Cell>
                <Table.Cell className="line-clamp-1 max-w-[200px]">
                  {story.title}
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
          <div className="flex justify-center mt-5">
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
      </>
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
          <div className="flex justify-center gap-4">
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
            <Button color="failure" onClick={() => setShowModal(false)} disabled={actionLoading}>
              No, cancel
            </Button>
          </div>
        </div>
      );
    } else if (activeTab === "stories" && storyToAction) {
      return (
        <div className="text-center">
          <HiOutlineExclamationCircle className="h-14 w-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto" />
          <h3 className="mb-5 text-lg text-gray-500 dark:text-gray-400">
            {storyActionType === 'approve'
              ? 'Are you sure you want to approve this story?'
              : 'Are you sure you want to reject this story?'}
          </h3>
          <div className="flex justify-center gap-4">
            <Button
              color={storyActionType === 'approve' ? 'success' : 'failure'}
              onClick={handleStoryAction}
              disabled={actionLoading}
              className={storyActionType === 'approve' 
                ? "bg-gradient-to-r from-green-500 to-teal-500" 
                : "bg-gradient-to-r from-red-500 to-pink-500"}
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
              color="gray"
              onClick={() => setShowModal(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
          </div>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto p-3">
      <h1 className="text-center text-3xl my-5 font-bold text-gray-800 dark:text-gray-100">
        Manage Requests
      </h1>
      
      {/* Custom tabs implementation */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <ul className="flex flex-wrap -mb-px text-sm font-medium text-center justify-center">
          <li className="mr-2">
            <button
              className={`inline-block p-4 rounded-t-lg border-b-2 ${
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
              <div className="flex items-center gap-2">
                <span>Publisher Requests</span>
                {pendingPublisherCount > 0 && (
                  <Badge color="failure" className="ml-1">
                    {pendingPublisherCount}
                  </Badge>
                )}
              </div>
            </button>
          </li>
          <li className="mr-2">
            <button
              className={`inline-block p-4 rounded-t-lg border-b-2 ${
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
              <div className="flex items-center gap-2">
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
      
      <div className="tab-content">
        {activeTab === "publisher" && renderPublisherContent()}
        {activeTab === "stories" && renderStoriesContent()}
      </div>
      
      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        popup
        size="md"
      >
        <Modal.Header />
        <Modal.Body>
          {renderModalContent()}
        </Modal.Body>
      </Modal>
    </div>
  );
} 