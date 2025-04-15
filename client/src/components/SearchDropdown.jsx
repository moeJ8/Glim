import { Spinner, Avatar } from "flowbite-react";
import PropTypes from 'prop-types';

export default function SearchDropdown({
    isLoading,
    searchResults,
    userResults,
    activeTab,
    setActiveTab,
    searchTerm,
    handleResultClick,
    handleUserClick,
    stripHtml
}) {
    const renderPostItems = () => {
        if (searchResults.length === 0) {
            return (
                <div className="p-3 text-center text-gray-500 dark:text-gray-400">
                    No posts found
                </div>
            );
        }

        return searchResults.map(post => (
            <div 
                key={post._id}
                className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                onClick={() => handleResultClick(post)}
            >
                <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
                    {post.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                    {stripHtml(post.content)}
                </p>
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                        {post.category}
                    </span>
                </div>
            </div>
        ));
    };
    const renderUserItems = () => {
        if (userResults.length === 0) {
            return (
                <div className="p-3 text-center text-gray-500 dark:text-gray-400">
                    No users found
                </div>
            );
        }

        return userResults.map(user => (
            <div 
                key={user._id}
                className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                onClick={() => handleUserClick(user)}
            >
                <div className="flex items-center gap-3">
                    <Avatar 
                        img={user.profilePicture} 
                        rounded 
                        size="sm"
                        alt={user.username}
                    />
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                            {user.username}
                        </h3>
                        {(user.isAdmin || user.isPublisher) && (
                            <div className="flex gap-2 mt-1">
                                {user.isAdmin && (
                                    <span className="px-2 py-1 text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 rounded-full">
                                        Admin
                                    </span>
                                )}
                                {user.isPublisher && (
                                    <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-full">
                                        Publisher
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        ));
    };

    // Render loading spinner
    if (isLoading) {
        return (
            <div className="absolute top-full left-0 w-[300px] mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-[400px] overflow-y-auto">
                <div className="flex justify-center items-center p-4">
                    <Spinner size="sm" />
                </div>
            </div>
        );
    }
    if (searchResults.length === 0 && userResults.length === 0 && searchTerm.length > 2) {
        return (
            <div className="absolute top-full left-0 w-[300px] mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-[400px] overflow-y-auto">
                <div className="p-3 text-center text-gray-500 dark:text-gray-400">
                    No results found
                </div>
            </div>
        );
    }

    if (searchResults.length === 0 && userResults.length === 0) {
        return null;
    }

    return (
        <div className="absolute top-full left-0 w-[300px] mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-[400px] overflow-y-auto">
            {/* Tabs navigation */}
            <div className="border-b border-gray-200 dark:border-gray-700">
                <div className="flex">
                    <button 
                        className={`flex-1 py-2 px-4 text-center focus:outline-none ${
                            activeTab === 'posts' 
                                ? 'bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400' 
                                : 'text-gray-600 dark:text-gray-400'
                        }`}
                        onClick={() => setActiveTab('posts')}
                    >
                        Posts {searchResults.length > 0 && `(${searchResults.length})`}
                    </button>
                    <button 
                        className={`flex-1 py-2 px-4 text-center focus:outline-none ${
                            activeTab === 'users' 
                                ? 'bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400' 
                                : 'text-gray-600 dark:text-gray-400'
                        }`}
                        onClick={() => setActiveTab('users')}
                    >
                        Users {userResults.length > 0 && `(${userResults.length})`}
                    </button>
                </div>
            </div>
            
            {/* Tab content */}
            {activeTab === 'posts' ? renderPostItems() : renderUserItems()}
        </div>
    );
}

// PropTypes for type checking
SearchDropdown.propTypes = {
    isLoading: PropTypes.bool.isRequired,
    searchResults: PropTypes.array.isRequired,
    userResults: PropTypes.array.isRequired,
    activeTab: PropTypes.string.isRequired,
    setActiveTab: PropTypes.func.isRequired,
    searchTerm: PropTypes.string.isRequired,
    handleResultClick: PropTypes.func.isRequired,
    handleUserClick: PropTypes.func.isRequired,
    stripHtml: PropTypes.func.isRequired
}; 