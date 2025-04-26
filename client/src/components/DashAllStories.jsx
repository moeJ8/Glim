import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Table, Modal, Spinner, Alert, Select, TextInput, Badge } from 'flowbite-react';
import { HiOutlineExclamationCircle } from 'react-icons/hi';
import { HiOutlineSearch } from 'react-icons/hi';
import { FaEdit, FaTrash } from 'react-icons/fa';

export default function DashAllStories() {
  const [stories, setStories] = useState([]);
  const [showMore, setShowMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [storyIdToDelete, setStoryIdToDelete] = useState(null);
  const [usernames, setUsernames] = useState({});
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        setLoading(true);
        // Fetch stories with optional status filter
        const statusParam = selectedStatus !== 'all' ? `&status=${selectedStatus}` : '';
        const searchParam = searchTerm ? `&searchTerm=${searchTerm}` : '';
        
        const res = await fetch(`/api/story/get?limit=20${statusParam}${searchParam}`);
        const data = await res.json();
        
        if (res.ok) {
          setStories(data.stories);
          if (data.stories.length < 20) {
            setShowMore(false);
          } else {
            setShowMore(true);
          }
        } else {
          setError(data.message);
        }
        
        // Fetch users for mapping user IDs to usernames
        const usersRes = await fetch('/api/user/getusers');
        const usersData = await usersRes.json();
        
        if (usersRes.ok) {
          // Create a map of user IDs to usernames only
          const usernamesMap = {};
          usersData.users.forEach(user => {
            usernamesMap[user._id] = user.username;
          });
          setUsernames(usernamesMap);
        }
      } catch (error) {
        setError('Failed to fetch stories');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStories();
  }, [selectedStatus, searchTerm]);

  const handleShowMore = async () => {
    const startIndex = stories.length;
    try {
      const statusParam = selectedStatus !== 'all' ? `&status=${selectedStatus}` : '';
      const searchParam = searchTerm ? `&searchTerm=${searchTerm}` : '';
      
      const res = await fetch(`/api/story/get?startIndex=${startIndex}&limit=20${statusParam}${searchParam}`);
      const data = await res.json();
      
      if (res.ok) {
        setStories([...stories, ...data.stories]);
        if (data.stories.length < 20) {
          setShowMore(false);
        }
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteClick = (storyId) => {
    setStoryIdToDelete(storyId);
    setShowModal(true);
  };

  const handleDeleteStory = async () => {
    try {
      const res = await fetch(`/api/story/delete/${storyIdToDelete}`, {
        method: 'DELETE',
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setStories(stories.filter((story) => story._id !== storyIdToDelete));
        setShowModal(false);
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
  };

  const handleSearchInputChange = (e) => {
    setSearchInput(e.target.value);
  };

  const handleSearchSubmit = () => {
    setSearchTerm(searchInput);
  };

  const handleRemoveFilters = () => {
    setSelectedStatus('all');
    setSearchTerm('');
    setSearchInput('');
  };

  // Get badge color based on status
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'failure';
      default:
        return 'gray';
    }
  };

  // Render stories as cards for mobile view
  const renderStoryCards = () => {
    return (
      <div className="grid grid-cols-1 gap-4">
        {stories.map((story) => (
          <div key={story._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            {/* Story Image */}
            <Link to={`/narrative/${story.slug}`}>
              <img 
                src={story.image} 
                alt={story.title}
                className="w-full h-40 object-cover hover:scale-105 transition-transform duration-300" 
              />
            </Link>
            
            {/* Story Info */}
            <div className="p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(story.createdAt).toLocaleDateString()}
                </span>
                <Badge color={getStatusBadgeColor(story.status)} className="px-2 py-1 text-xs">
                  {story.status}
                </Badge>
              </div>
              
              <Link to={`/narrative/${story.slug}`} className="block mb-2">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2">
                  {story.title}
                </h3>
              </Link>
              
              <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                <div className="flex items-center gap-1">
                  <span className="text-gray-500 dark:text-gray-400">User:</span>
                  <Link to={`/profile/${usernames[story.userId]}`} className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
                    {usernames[story.userId] || 'Unknown'}
                  </Link>
                </div>
                
                <div className="flex items-center gap-1">
                  <span className="text-gray-500 dark:text-gray-400">Category:</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">{story.category}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <span className="text-gray-500 dark:text-gray-400">Country:</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">{story.country}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <span className="text-gray-500 dark:text-gray-400">Views:</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">{story.views || 0}</span>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex justify-between gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                <Link 
                  to={`/update-narrative/${story._id}`} 
                  className="flex-1 bg-teal-500 hover:bg-teal-600 text-white text-center py-2 px-3 rounded text-sm font-medium transition-colors flex items-center justify-center"
                >
                  <FaEdit className="mr-1" /> Edit
                </Link>
                <button
                  onClick={() => handleDeleteClick(story._id)}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded text-sm font-medium transition-colors flex items-center justify-center"
                >
                  <FaTrash className="mr-1" /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
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
      <div className="p-4 max-w-4xl mx-auto">
        <Alert color="failure">
          <span>{error}</span>
        </Alert>
      </div>
    );
  }

  return (
    <div className="table-auto overflow-x-scroll md:mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500">
      <h1 className="text-2xl font-semibold mb-6 text-center">All Narratives</h1>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Status filter */}
        <div className="md:w-1/4">
          <Select
            value={selectedStatus}
            onChange={handleStatusChange}
          >
            <option value="all">All Statuses</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </Select>
        </div>
        
        {/* Search input */}
        <div className="md:w-3/4 flex gap-2">
          <div className="flex-grow">
            <TextInput
              type="text"
              placeholder="Search by title, user, or country..."
              value={searchInput}
              onChange={handleSearchInputChange}
              icon={HiOutlineSearch}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
            />
          </div>
          <Button 
            outline
            gradientDuoTone="purpleToBlue"
            onClick={handleSearchSubmit}
          >
            Search
          </Button>
          <Button 
            outline
            gradientDuoTone="pinkToOrange"
            onClick={handleRemoveFilters}
          >
            Reset
          </Button>
        </div>
      </div>
      
      {stories.length === 0 ? (
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold mb-2">No narratives found</h2>
          <p className="text-gray-500 dark:text-gray-400">
            Try adjusting your filters or search term
          </p>
        </div>
      ) : isMobile ? (
        // Mobile card view
        <>
          {renderStoryCards()}
          
          {showMore && (
            <div className="flex justify-center mt-4">
              <Button
                onClick={handleShowMore}
                color="purple"
                className="mt-4"
              >
                Show More
              </Button>
            </div>
          )}
        </>
      ) : (
        // Desktop table view
        <div className="hidden md:block">
          <Table hoverable className="shadow-md">
            <Table.Head>
              <Table.HeadCell>Date</Table.HeadCell>
              <Table.HeadCell>User</Table.HeadCell>
              <Table.HeadCell>Title</Table.HeadCell>
              <Table.HeadCell>Category</Table.HeadCell>
              <Table.HeadCell>Country</Table.HeadCell>
              <Table.HeadCell>Views</Table.HeadCell>
              <Table.HeadCell>Delete</Table.HeadCell>
              <Table.HeadCell>Edit</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {stories.map((story) => (
                <Table.Row
                  key={story._id}
                  className="bg-white dark:border-gray-700 dark:bg-gray-800"
                >
                  <Table.Cell className="whitespace-nowrap text-gray-900 dark:text-gray-400">
                    {new Date(story.createdAt).toLocaleDateString()}
                  </Table.Cell>
                  <Table.Cell>
                    <Link to={`/profile/${usernames[story.userId]}`} className="text-blue-500 hover:underline">
                      {usernames[story.userId] || story.userId}
                    </Link>
                  </Table.Cell>
                  <Table.Cell className="max-w-[250px] truncate">
                    <Link to={`/narrative/${story.slug}`} className="text-blue-600 hover:underline font-medium">
                      {story.title}
                    </Link>
                  </Table.Cell>
                  <Table.Cell>{story.category}</Table.Cell>
                  <Table.Cell>{story.country}</Table.Cell>
                  <Table.Cell>{story.views}</Table.Cell>
                  <Table.Cell>
                    <span 
                      onClick={() => handleDeleteClick(story._id)} 
                      className="font-medium text-red-500 hover:underline cursor-pointer"
                    >
                      Delete
                    </span>
                  </Table.Cell>
                  <Table.Cell>
                    <Link to={`/update-narrative/${story._id}`} className="text-teal-500 hover:underline">
                      <span>Edit</span>
                    </Link>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
          
          {showMore && (
            <button onClick={handleShowMore} className="w-full text-teal-500 self-center text-sm py-7">
              Show More
            </button>
          )}
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
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
              <Button color="failure" onClick={handleDeleteStory}>
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