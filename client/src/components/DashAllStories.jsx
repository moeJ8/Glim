import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Table, Modal, Spinner, Alert, Select, TextInput } from 'flowbite-react';
import { HiOutlineExclamationCircle } from 'react-icons/hi';
import { HiOutlineSearch } from 'react-icons/hi';

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
    <div className="p-4 w-full">
      <h1 className="text-2xl font-semibold mb-6">All Narratives</h1>
      
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
      ) : (
        <div className="overflow-x-auto">
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
            <div className="flex justify-center mt-4">
              <Button
                onClick={handleShowMore}
                gradientDuoTone="purpleToPink"
                outline
              >
                Show More
              </Button>
            </div>
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