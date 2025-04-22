import { Link } from "react-router-dom";
import { Spinner, TextInput } from "flowbite-react";
import { useState } from "react";
import { HiSearch } from "react-icons/hi";

export default function UserListModal({ 
  isOpen, 
  onClose, 
  title, 
  users, 
  loading, 
  emptyIcon = "👥", 
  emptyTitle = "No users", 
  emptyMessage = "No users to display" 
}) {
  const [searchTerm, setSearchTerm] = useState("");
  
  if (!isOpen) return null;
  
  const filteredUsers = users?.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-medium text-gray-900 dark:text-white">{title}</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        {/* Modal Body */}
        <div className="relative">
          {/* Search Bar */}
          {!loading && users && users.length > 0 && (
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <TextInput
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={HiSearch}
              />
            </div>
          )}
          
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Spinner size="lg" />
            </div>
          ) : filteredUsers && filteredUsers.length > 0 ? (
            <div className="max-h-[60vh] overflow-y-auto">
              {filteredUsers.map(user => (
                <div key={user._id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 flex-shrink-0 overflow-hidden rounded-full border-2 border-gray-200 dark:border-gray-600">
                      <img 
                        src={user.profilePicture} 
                        alt={user.username} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <Link
                        to={`/profile/${user.username}`}
                        className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                        onClick={onClose}
                      >
                        {user.username}
                      </Link>
                      <div className="flex gap-1 mt-1">
                        {user.isAdmin && (
                          <span className="px-2 py-0.5 text-xs bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-100 rounded-full">
                            Admin
                          </span>
                        )}
                        {user.isPublisher && (
                          <span className="px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-100 rounded-full">
                            Publisher
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 px-4 text-gray-500 dark:text-gray-400">
              {searchTerm ? (
                <>
                  <div className="text-3xl mb-4 opacity-30">🔍</div>
                  <p className="font-medium">No results found</p>
                  <p className="text-sm mt-1">Try a different search term</p>
                </>
              ) : (
                <>
                  <div className="text-5xl mb-4 opacity-30">{emptyIcon}</div>
                  <p className="font-medium">{emptyTitle}</p>
                  <p className="text-sm mt-1">{emptyMessage}</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 