import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Table, Modal, Spinner, Alert } from 'flowbite-react';
import { HiOutlineExclamationCircle } from 'react-icons/hi';
import { FaEye, FaCheck, FaTimes } from 'react-icons/fa';

export default function DashPendingStories() {
  const [pendingStories, setPendingStories] = useState([]);
  const [showMore, setShowMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [storyToAction, setStoryToAction] = useState(null);
  const [actionType, setActionType] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchPendingStories = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/story/pending');
        const data = await res.json();
        
        if (res.ok) {
          setPendingStories(data.stories);
          if (data.stories.length < 9) {
            setShowMore(false);
          }
        } else {
          setError(data.message);
        }
      } catch (error) {
        setError('Failed to fetch pending stories');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPendingStories();
  }, []);

  const handleShowMore = async () => {
    const startIndex = pendingStories.length;
    try {
      const res = await fetch(`/api/story/pending?startIndex=${startIndex}`);
      const data = await res.json();
      
      if (res.ok) {
        setPendingStories([...pendingStories, ...data.stories]);
        if (data.stories.length < 9) {
          setShowMore(false);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const openActionModal = (story, action) => {
    setStoryToAction(story);
    setActionType(action);
    setShowModal(true);
  };

  const handleStoryAction = async () => {
    try {
      setActionLoading(true);
      
      const res = await fetch(`/api/story/status/${storyToAction._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: actionType === 'approve' ? 'approved' : 'rejected'
        })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setPendingStories(pendingStories.filter(story => story._id !== storyToAction._id));
        setShowModal(false);
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setActionLoading(false);
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
      <div className="p-4 max-w-4xl mx-auto">
        <Alert color="failure">
          <span>{error}</span>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-4 w-full overflow-x-auto">
      <h1 className="text-2xl font-semibold mb-4">Pending Stories</h1>
      
      {pendingStories.length === 0 ? (
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold mb-2">No pending stories to review</h2>
          <p className="text-gray-500 dark:text-gray-400">
            All stories have been reviewed
          </p>
        </div>
      ) : (
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
                  <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                    {new Date(story.createdAt).toLocaleDateString()}
                  </Table.Cell>
                  <Table.Cell>{story.userId}</Table.Cell>
                  <Table.Cell className="line-clamp-1 max-w-[200px]">
                    {story.title}
                  </Table.Cell>
                  <Table.Cell>{story.category}</Table.Cell>
                  <Table.Cell>{story.country}</Table.Cell>
                  <Table.Cell className="flex items-center gap-2">
                    <Link to={`/story/${story.slug}`}>
                      <Button size="sm" color="info" className="font-medium">
                        <FaEye className="mr-2" />
                        View
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      color="success"
                      onClick={() => openActionModal(story, 'approve')}
                    >
                      <FaCheck className="mr-2" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      color="failure"
                      onClick={() => openActionModal(story, 'reject')}
                    >
                      <FaTimes className="mr-2" />
                      Reject
                    </Button>
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
        </>
      )}
      
      {/* Action Modal */}
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
              {actionType === 'approve'
                ? 'Are you sure you want to approve this story?'
                : 'Are you sure you want to reject this story?'}
            </h3>
            <div className="flex justify-center gap-4">
              <Button
                color={actionType === 'approve' ? 'success' : 'failure'}
                onClick={handleStoryAction}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    <span>Processing...</span>
                  </>
                ) : (
                  `Yes, ${actionType} it`
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
        </Modal.Body>
      </Modal>
    </div>
  );
} 