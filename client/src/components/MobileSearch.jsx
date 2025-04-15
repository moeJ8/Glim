import { TextInput, Button, Spinner, Avatar } from "flowbite-react";
import { Link } from "react-router-dom";
import { AiOutlineSearch } from "react-icons/ai";
import { useRef, useEffect } from "react";
import PropTypes from 'prop-types';

export default function MobileSearch({ 
    showMobileSearch, 
    setShowMobileSearch, 
    searchTerm, 
    setSearchTerm, 
    searchResults, 
    userResults,
    activeTab, 
    setActiveTab,
    setShowDropdown,
    isLoading,
    handleSubmit,
    stripHtml
}) {
    const mobileSearchRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (mobileSearchRef.current && 
                !mobileSearchRef.current.contains(event.target) && 
                event.target.id !== 'mobileSearchToggle') {
                setShowMobileSearch(false);
            }
        };

        if (showMobileSearch) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showMobileSearch, setShowMobileSearch]);

    // Helper function to render the search form
    const renderSearchForm = () => (
        <form onSubmit={handleSubmit} className="flex gap-2">
            <TextInput
                type="text"
                placeholder="Search posts or users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
                autoFocus
            />
            <Button type="submit" gradientDuoTone="purpleToBlue">
                <AiOutlineSearch className="h-5 w-5" />
            </Button>
        </form>
    );
    const renderPostItem = (post) => (
        <Link 
            key={post._id}
            to={`/post/${post.slug}`}
            className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
            onClick={() => handleSearchItemClick()}
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
        </Link>
    );

    const renderUserItem = (user) => (
        <Link 
            key={user._id}
            to={`/profile/${user.username}`}
            className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
            onClick={() => handleSearchItemClick()}
        >
            <div className="flex items-center gap-3">
                <Avatar 
                    img={user.profilePicture} 
                    rounded 
                    size="md"
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
        </Link>
    );
    const renderTabContent = () => {
        if (activeTab === 'posts') {
            return (
                <div>
                    {searchResults.length > 0 ? (
                        searchResults.map(post => renderPostItem(post))
                    ) : (
                        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                            No posts found
                        </div>
                    )}
                </div>
            );
        } else {
            return (
                <div>
                    {userResults.length > 0 ? (
                        userResults.map(user => renderUserItem(user))
                    ) : (
                        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                            No users found
                        </div>
                    )}
                </div>
            );
        }
    };

    const handleSearchItemClick = () => {
        setShowMobileSearch(false);
        setSearchTerm("");
        setShowDropdown(false);
    };

    if (!showMobileSearch) {
        return null;
    }

    return (
        <div 
            className="md:hidden fixed top-0 left-0 right-0 bottom-0 bg-white dark:bg-gray-900 z-50 flex flex-col"
            ref={mobileSearchRef}
        >
            <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                <h3 className="font-bold text-gray-900 dark:text-white">Search</h3>
                <Button 
                    color="gray" 
                    pill
                    onClick={() => {
                        setShowMobileSearch(false);
                        setSearchTerm("");
                    }}
                >
                    Close
                </Button>
            </div>
            
            {/* Search form */}
            <div className="p-3">
                {renderSearchForm()}
            </div>

            {/* Results area */}
            <div className="flex-1 p-3 overflow-y-auto">
                {/* Show prompt if search term is too short */}
                {searchTerm.length < 3 ? (
                    <div className="text-center text-gray-500 dark:text-gray-400 p-4">
                        Type at least 3 characters to search
                    </div>
                ) : isLoading ? (
                    <div className="flex justify-center items-center p-4">
                        <Spinner size="lg" />
                    </div>
                ) : (searchResults.length > 0 || userResults.length > 0) ? (
                    <div className="border bg-white dark:bg-gray-800 rounded-lg shadow-md">
                        {/* Tab navigation */}
                        <div className="border-b border-gray-200 dark:border-gray-700">
                            <div className="flex">
                                <button 
                                    className={`flex-1 py-3 px-4 text-center focus:outline-none ${
                                        activeTab === 'posts' 
                                            ? 'bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400 font-medium' 
                                            : 'text-gray-600 dark:text-gray-400'
                                    }`}
                                    onClick={() => setActiveTab('posts')}
                                >
                                    Posts {searchResults.length > 0 && `(${searchResults.length})`}
                                </button>
                                <button 
                                    className={`flex-1 py-3 px-4 text-center focus:outline-none ${
                                        activeTab === 'users' 
                                            ? 'bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400 font-medium' 
                                            : 'text-gray-600 dark:text-gray-400'
                                    }`}
                                    onClick={() => setActiveTab('users')}
                                >
                                    Users {userResults.length > 0 && `(${userResults.length})`}
                                </button>
                            </div>
                        </div>
                        
                        {/* Tab content */}
                        {renderTabContent()}
                    </div>
                ) : searchTerm.length >= 3 && (
                    <div className="text-center text-gray-500 dark:text-gray-400 p-4">
                        No results found
                    </div>
                )}
            </div>
        </div>
    );
}
MobileSearch.propTypes = {
    showMobileSearch: PropTypes.bool.isRequired,
    setShowMobileSearch: PropTypes.func.isRequired,
    searchTerm: PropTypes.string.isRequired,
    setSearchTerm: PropTypes.func.isRequired,
    searchResults: PropTypes.array.isRequired,
    userResults: PropTypes.array.isRequired,
    activeTab: PropTypes.string.isRequired,
    setActiveTab: PropTypes.func.isRequired,
    setShowDropdown: PropTypes.func.isRequired,
    isLoading: PropTypes.bool.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    stripHtml: PropTypes.func.isRequired
}; 