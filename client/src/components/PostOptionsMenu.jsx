import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiDotsVertical, HiPencil, HiTrash } from 'react-icons/hi';
import { FaFlag } from 'react-icons/fa';
import PropTypes from 'prop-types';
import CustomModal from './CustomModal';
import { Button } from 'flowbite-react';
import { HiOutlineExclamationCircle } from 'react-icons/hi';

export default function PostOptionsMenu({ postId, onDelete, onReport, isOwner, isAdmin, isActualOwner }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleDeleteClick = () => {
    setIsOpen(false);
    setShowDeleteModal(true);
  };

  const handleReportClick = () => {
    setIsOpen(false);
    onReport();
  };

  const confirmDelete = () => {
    setShowDeleteModal(false);
    onDelete(postId);
  };

  // Determine if we should show the report button
  // Show for admins who are not the post owner, hide for actual post owner
  const showReportButton = (isAdmin && !isActualOwner) || (!isOwner && !isActualOwner);

  return (
    <div className="relative" ref={menuRef}>
      {/* Menu toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label="Post options"
      >
        <HiDotsVertical className="text-gray-600 dark:text-gray-300 text-lg" />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-700 overflow-hidden">
          {isOwner ? (
            <>
              <Link
                to={`/update-post/${postId}`}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                onClick={() => setIsOpen(false)}
              >
                <HiPencil className="text-teal-500" />
                <span>Edit Post</span>
              </Link>
              <button
                onClick={handleDeleteClick}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
              >
                <HiTrash className="text-red-500" />
                <span>Delete Post</span>
              </button>
              {/* Show report button for admins who are not the post owner */}
              {showReportButton && (
                <button
                  onClick={handleReportClick}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                >
                  <FaFlag className="text-orange-500" />
                  <span>Report Post</span>
                </button>
              )}
            </>
          ) : (
            <button
              onClick={handleReportClick}
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
            >
              <FaFlag className="text-orange-500" />
              <span>Report Post</span>
            </button>
          )}
        </div>
      )}

      {/* Delete confirmation modal */}
      <CustomModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Post"
        maxWidth="md"
        footer={
          <div className="flex justify-center gap-4 w-full">
            <Button 
              color="failure" 
              onClick={confirmDelete}
              className="bg-gradient-to-r from-red-500 to-pink-500"
            >
              Yes, delete it
            </Button>
            <Button color="gray" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
          </div>
        }
      >
        <div className="text-center py-4">
          <HiOutlineExclamationCircle className="h-14 w-14 text-red-500 dark:text-red-400 mb-4 mx-auto" />
          <h3 className="mb-5 text-lg text-gray-600 dark:text-gray-300">
            Are you sure you want to delete this post?
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            This action cannot be undone. All data associated with this post will be permanently removed.
          </p>
        </div>
      </CustomModal>
    </div>
  );
}

PostOptionsMenu.propTypes = {
  postId: PropTypes.string.isRequired,
  onDelete: PropTypes.func.isRequired,
  onReport: PropTypes.func.isRequired,
  isOwner: PropTypes.bool.isRequired,
  isAdmin: PropTypes.bool,
  isActualOwner: PropTypes.bool
};

PostOptionsMenu.defaultProps = {
  isAdmin: false,
  isActualOwner: false
}; 