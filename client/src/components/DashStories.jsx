import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Button, Table, Modal, Spinner, Alert, Badge, Card } from 'flowbite-react';
import { HiOutlineExclamationCircle, HiFilter } from 'react-icons/hi';
import { FaEdit, FaTrash, FaEye, FaBookOpen } from 'react-icons/fa';
import moment from 'moment';

export default function DashStories() {
  const { currentUser } = useSelector((state) => state.user);
  const [userStories, setUserStories] = useState([]);
  const [showMore, setShowMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [storyIdToDelete, setStoryIdToDelete] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [totalStories, setTotalStories] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchUserStories = async () => {
      try {
        setLoading(true);
        const statusParam = filterStatus !== 'all' ? `?status=${filterStatus}` : '';
        const res = await fetch(`/api/story/user/${currentUser._id}${statusParam}`);
        const data = await res.json();
        
        if (res.ok) {
          setUserStories(data.stories);
          setTotalStories(data.totalStories || data.stories.length);
          if (data.stories.length < 9) {
            setShowMore(false);
          } else {
            setShowMore(true);
          }
        } else {
          setError(data.message);
        }
      } catch (error) {
        setError('Failed to fetch stories');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserStories();
    
  }, [currentUser._id, filterStatus]);

  const handleShowMore = async () => {
    const startIndex = userStories.length;
    try {
      const statusParam = filterStatus !== 'all' ? `&status=${filterStatus}` : '';
      const res = await fetch(`/api/story/user/${currentUser._id}?startIndex=${startIndex}${statusParam}`);
      const data = await res.json();
      
      if (res.ok) {
        setUserStories([...userStories, ...data.stories]);
        if (data.stories.length < 9) {
          setShowMore(false);
        }
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteStory = async () => {
    try {
      const res = await fetch(`/api/story/delete/${storyIdToDelete}`, {
        method: 'DELETE',
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setUserStories(userStories.filter((story) => story._id !== storyIdToDelete));
        setTotalStories(prev => prev - 1);
        setShowModal(false);
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Function to get status badge style
  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'approved':
        return {
          color: 'success',
          background: 'linear-gradient(to right, #10b981, #34d399)'
        };
      case 'pending':
        return {
          color: 'warning',
          background: 'linear-gradient(to right, #f59e0b, #fbbf24)'
        };
      case 'rejected':
        return {
          color: 'failure',
          background: 'linear-gradient(to right, #ef4444, #f87171)'
        };
      default:
        return {
          color: 'gray',
          background: 'linear-gradient(to right, #6b7280, #9ca3af)'
        };
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <Spinner size="xl" className="mx-auto" />
          <p className="mt-2 text-gray-500 dark:text-gray-400">Loading narratives...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 max-w-4xl mx-auto">
        <Alert color="failure" className="my-5 border-l-4 border-red-500">
          <span>{error}</span>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-3">
      <h1 className="text-center text-3xl my-5 font-bold text-gray-800 dark:text-gray-100">
        Manage Your Narratives
      </h1>
      
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold flex items-center">
          <span className="bg-gradient-to-r from-purple-600 to-pink-500 w-2 h-6 rounded mr-2 inline-block"></span>
          Total Narratives: {totalStories}
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <div className="flex items-center">
            {(currentUser.isAdmin || currentUser.isPublisher) && (
              <Link to="/create-narrative" className="sm:ml-auto">
                <Button gradientDuoTone="purpleToPink" size="sm" className="sm:mr-3">
                  Create New Narrative
                </Button>
              </Link>
            )}
          </div>
          
          <div className="flex items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400 mr-1 flex items-center">
              <HiFilter className="mr-1" /> Filter:
            </span>
            <div className="grid grid-cols-4 gap-1 w-full sm:flex sm:gap-2 sm:w-auto">
              <Button 
                size="xs"
                color={filterStatus === 'all' ? 'purple' : 'gray'}
                onClick={() => setFilterStatus('all')}
                className={filterStatus === 'all' ? 'bg-gradient-to-r from-purple-500 to-indigo-500 border-0' : ''}
              >
                All
              </Button>
              <Button 
                size="xs"
                color={filterStatus === 'approved' ? 'success' : 'gray'}
                onClick={() => setFilterStatus('approved')}
                className={filterStatus === 'approved' ? 'bg-gradient-to-r from-green-500 to-teal-500 border-0' : ''}
              >
                Approved
              </Button>
              <Button 
                size="xs"
                color={filterStatus === 'pending' ? 'warning' : 'gray'}
                onClick={() => setFilterStatus('pending')}
                className={filterStatus === 'pending' ? 'bg-gradient-to-r from-yellow-400 to-orange-500 border-0' : ''}
              >
                Pending
              </Button>
              <Button 
                size="xs"
                color={filterStatus === 'rejected' ? 'failure' : 'gray'}
                onClick={() => setFilterStatus('rejected')}
                className={filterStatus === 'rejected' ? 'bg-gradient-to-r from-red-500 to-pink-500 border-0' : ''}
              >
                Rejected
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {userStories.length === 0 ? (
        <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-lg shadow-sm text-center">
          <div className="mx-auto w-16 h-16 mb-4 flex items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20">
            <FaBookOpen className="w-8 h-8 text-blue-500 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-medium mb-1">No Narratives Found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {filterStatus !== 'all' 
              ? `You don't have any ${filterStatus} narratives.` 
              : "You haven't shared any narratives yet."}
          </p>
          {(currentUser.isAdmin || currentUser.isPublisher) && (
            <Link to="/create-narrative">
              <Button gradientDuoTone="purpleToPink">Create Your First Narrative</Button>
            </Link>
          )}
        </div>
      ) : isMobile ? (
        // Mobile card view
        <div className="grid grid-cols-1 gap-4">
          {userStories.map((story) => (
            <Card key={story._id} className="mb-2 border-0 shadow-md hover:shadow-lg transition-shadow dark:bg-gray-800">
              <div className="flex justify-between items-start">
                <Link to={`/narrative/${story.slug}`} className="text-blue-600 hover:underline">
                  <h5 className="text-lg font-bold line-clamp-1 flex-1">{story.title}</h5>
                </Link>
                <Badge 
                  color={getStatusBadgeStyle(story.status).color}
                  style={{background: getStatusBadgeStyle(story.status).background}}
                  className="ml-2"
                >
                  {story.status}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                <div>
                  <span className="font-semibold text-gray-700 dark:text-gray-300">Category:</span>
                  <p className="text-gray-600 dark:text-gray-400">{story.category}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700 dark:text-gray-300">Country:</span>
                  <p className="text-gray-600 dark:text-gray-400">{story.country}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700 dark:text-gray-300">Views:</span>
                  <p className="text-gray-600 dark:text-gray-400">{story.views}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700 dark:text-gray-300">Date:</span>
                  <p className="text-gray-600 dark:text-gray-400">{moment(story.createdAt).format('MMM D, YYYY')}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-end gap-2 mt-3">
                <Link to={`/update-narrative/${story._id}`}>
                  <Button size="xs" color="warning" className="font-medium bg-gradient-to-r from-yellow-400 to-orange-500">
                    <FaEdit className="mr-2" />
                    Edit
                  </Button>
                </Link>
                <Button
                  size="xs"
                  color="failure"
                  className="font-medium bg-gradient-to-r from-red-500 to-pink-500"
                  onClick={() => {
                    setShowModal(true);
                    setStoryIdToDelete(story._id);
                  }}
                >
                  <FaTrash className="mr-2" />
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        // Desktop table view
        <div className="overflow-hidden rounded-lg shadow">
          <Table hoverable className="min-w-full" theme={{
            root: {
              base: "w-full text-left text-sm text-gray-500 dark:text-gray-400"
            },
            head: {
              base: "bg-gradient-to-r from-purple-50 to-pink-50 dark:bg-gradient-to-r dark:from-gray-700 dark:to-gray-800",
              cell: {
                base: "px-6 py-3 font-medium text-gray-900 dark:text-white"
              }
            }
          }}>
            <Table.Head>
              <Table.HeadCell className="py-3">Date</Table.HeadCell>
              <Table.HeadCell className="py-3">Title</Table.HeadCell>
              <Table.HeadCell className="py-3">Category</Table.HeadCell>
              <Table.HeadCell className="py-3">Country</Table.HeadCell>
              <Table.HeadCell className="py-3">Status</Table.HeadCell>
              <Table.HeadCell className="py-3">Views</Table.HeadCell>
              <Table.HeadCell className="py-3">Delete</Table.HeadCell>
              <Table.HeadCell className="py-3">Edit</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {userStories.map((story) => (
                <Table.Row
                  key={story._id}
                  className="bg-white dark:border-gray-700 dark:bg-gray-800"
                >
                  <Table.Cell className="whitespace-nowrap py-3">
                    <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full text-xs inline-flex items-center justify-center">
                      {moment(story.createdAt).fromNow()}
                    </span>
                  </Table.Cell>
                  <Table.Cell className="max-w-[250px] truncate py-3">
                    <Link to={`/narrative/${story.slug}`} className="text-blue-600 hover:underline font-medium">
                      {story.title}
                    </Link>
                  </Table.Cell>
                  <Table.Cell className="py-3">{story.category}</Table.Cell>
                  <Table.Cell className="py-3">{story.country}</Table.Cell>
                  <Table.Cell className="whitespace-nowrap py-3">
                    <Badge 
                      color={getStatusBadgeStyle(story.status).color}
                      className="w-fit"
                      style={{
                        background: getStatusBadgeStyle(story.status).background
                      }}
                    >
                      {story.status}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell className="py-3">{story.views}</Table.Cell>
                  <Table.Cell className="py-3">
                    <span 
                      onClick={() => {
                        setShowModal(true);
                        setStoryIdToDelete(story._id);
                      }} 
                      className="font-medium text-red-500 hover:underline cursor-pointer"
                    >
                      Delete
                    </span>
                  </Table.Cell>
                  <Table.Cell className="py-3">
                    <Link to={`/update-narrative/${story._id}`} className="text-teal-500 hover:underline">
                      <span>Edit</span>
                    </Link>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>
      )}
      
      {showMore && userStories.length > 0 && (
        <div className="flex justify-center mt-5">
          <div className="flex gap-2 bg-gray-50 dark:bg-gray-800 p-2 rounded-lg shadow-sm">
            <Button
              onClick={handleShowMore}
              color="purple"
              className="bg-gradient-to-r from-purple-500 to-pink-500"
            >
              Show More
            </Button>
          </div>
        </div>
      )}
      
      {/* Delete Modal */}
      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        popup
        size="md"
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="h-14 w-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto" />
            <h3 className="mb-5 text-lg text-gray-500 dark:text-gray-400">
              Are you sure you want to delete this narrative?
            </h3>
            <div className="flex justify-center gap-4">
              <Button 
                color="failure" 
                onClick={handleDeleteStory}
                className="bg-gradient-to-r from-red-500 to-pink-500"
              >
                Yes, delete it
              </Button>
              <Button color="gray" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
} 