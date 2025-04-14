import { Button, Select, TextInput } from "flowbite-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PostCard from "../components/PostCard";

export default function Search() {
    const [SidebarData, setSidebarData] = useState({
        searchTerm: "",
        sort: "views",
        category: "uncategorized",
    });
    
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showMore, setShowMore] = useState(false);
    const [error, setError] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();

    const fetchPosts = async (searchParams) => {
        try {
            setLoading(true);
            setError(null);
            const searchQuery = searchParams.toString();
            const res = await fetch(`/api/post/getposts?${searchQuery}`);
            
            if(!res.ok){
                const errorData = await res.json();
                throw new Error(errorData.message || 'Failed to fetch posts');
            }
            
            const data = await res.json();
            setPosts(data.posts);
            setShowMore(data.posts.length === 9);
        } catch (error) {
            setError(error.message);
            setPosts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const searchTermFromUrl = urlParams.get("searchTerm");
        const sortFromUrl = urlParams.get("sort");
        const categoryFromUrl = urlParams.get("category");

        // If no sort parameter in URL, set it to views
        if (!sortFromUrl) {
            urlParams.set("sort", "views");
            navigate(`/search?${urlParams.toString()}`);
            return;
        }

        const newSidebarData = {
            searchTerm: searchTermFromUrl || "",
            sort: sortFromUrl || "views",
            category: categoryFromUrl || "uncategorized",
        };
        
        setSidebarData(newSidebarData);
        
        // Always fetch posts, even on initial load
        fetchPosts(urlParams);
    }, [location.search]);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setSidebarData(prev => ({
            ...prev,
            [id]: value
        }));
        const urlParams = new URLSearchParams(location.search);
        urlParams.set(id, value);
        navigate(`/search?${urlParams.toString()}`);
    }
    const handleShowMore = async () => {
        const numberOfPosts = posts.length;
        const startIndex = numberOfPosts;
        const urlParams = new URLSearchParams(location.search);
        urlParams.set("startIndex", startIndex);
        
        try {
            setLoading(true);
            const searchQuery = urlParams.toString();
            const res = await fetch(`/api/post/getposts?${searchQuery}`);
            
            if(!res.ok){
                const errorData = await res.json();
                throw new Error(errorData.message || 'Failed to fetch posts');
            }
            
            const data = await res.json();
            setPosts(prevPosts => [...prevPosts, ...data.posts]);
            setShowMore(data.posts.length === 9);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }
    return (
        <div className="flex flex-col md:flex-row">
            <div className="p-7 border-b md:border-r md:min-h-screen border-gray-500">
                <div className="flex flex-col gap-8">
                    <div className="flex items-center gap-2">
                        <label className="whitespace-nowrap font-semibold w-24">Search:</label>
                        <TextInput 
                            placeholder="Search..."
                            id="searchTerm"
                            type="text"
                            value={SidebarData.searchTerm}
                            onChange={handleChange}
                            className="flex-1"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="whitespace-nowrap font-semibold w-24">Sort:</label>
                        <Select 
                            onChange={handleChange} 
                            value={SidebarData.sort} 
                            id="sort"
                            className="flex-1"
                        >
                            <option value="views">Most Views</option>
                            <option value="desc">Latest</option>
                            <option value="asc">Oldest</option>
                        </Select>
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="whitespace-nowrap font-semibold w-24">Category:</label>
                        <Select 
                            onChange={handleChange} 
                            value={SidebarData.category} 
                            id="category"
                            className="flex-1"
                        >
                            <option value="uncategorized">All</option>
                            <option value="art">Art</option>
                            <option value="health">Health</option>
                            <option value="history">History</option>
                            <option value="literature">Literature</option>
                            <option value="music">Music</option>
                            <option value="news">News</option>
                            <option value="politics">Politics</option>
                            <option value="sport">Sport</option>
                            <option value="tech">Tech</option>
                        </Select>
                    </div>
                    <Button 
                        type="button" 
                        outline 
                        gradientDuoTone="purpleToPink" 
                        onClick={() => {
                            setSidebarData({
                                searchTerm: "",
                                sort: "views",
                                category: "uncategorized",
                            });
                            navigate("/search");
                            fetchPosts(new URLSearchParams());
                        }}
                    >
                        Remove Filters
                    </Button>
                </div>
            </div>
            <div className="w-full">
                <h1 className="text-3xl font-semibold sm:border-b border-gray-500 p-3 mt-5">Results:</h1>
                <div className="p-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {error && (
                        <p className="col-span-full text-xl font-semibold text-center text-red-500">
                            {error}
                        </p>
                    )}
                    {loading && (
                        <p className="col-span-full text-xl font-semibold text-center text-gray-500">
                            Loading...
                        </p>
                    )}
                    {!loading && !error && posts.length === 0 && (
                        <p className="col-span-full text-xl font-semibold text-center text-gray-500">
                            No results found.
                        </p>
                    )}
                    {!loading && !error && posts.map((post) => (
                        <div key={post._id} className="w-full">
                            <PostCard post={post} />
                        </div>
                    ))}
                    {showMore && !loading && !error && (
                        <button 
                            className="col-span-full text-teal-500 text-lg hover:underline p-7" 
                            onClick={handleShowMore}
                        >
                            Show More
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
