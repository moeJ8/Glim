import { Select, TextInput, Button } from "flowbite-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PostCard from "../components/PostCard";
import { FaSearch } from "react-icons/fa";

export default function Categories() {
    const [SidebarData, setSidebarData] = useState({
        searchTerm: "",
        sort: "views",
        category: "uncategorized",
    });

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showMore, setShowMore] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const searchTermFromUrl = urlParams.get("searchTerm");
        const sortFromUrl = urlParams.get("sort");
        const categoryFromUrl = urlParams.get("category");

        // If no sort parameter in URL, set it to views
        if (!sortFromUrl) {
            urlParams.set("sort", "views");
            navigate(`/categories?${urlParams.toString()}`);
            return;
        }

        if (searchTermFromUrl || sortFromUrl || categoryFromUrl) {
            setSidebarData({
                ...SidebarData,
                searchTerm: searchTermFromUrl || "",
                sort: sortFromUrl || "views",
                category: categoryFromUrl || "uncategorized",
            });
        }

        const fetchPosts = async () => {
            setLoading(true);
            const searchQuery = urlParams.toString();
            const res = await fetch(`/api/post/getposts?${searchQuery}`);
            if (!res.ok) {
                setLoading(false);
                return;
            }
            const data = await res.json();
            setPosts(data.posts);
            setLoading(false);
            if (data.posts.length === 9) {
                setShowMore(true);
            } else {
                setShowMore(false);
            }
        };

        fetchPosts();
    }, [location.search]);

    const handleChange = (e) => {
        if (e.target.id === "searchTerm") {
            setSidebarData({ ...SidebarData, searchTerm: e.target.value });
            // Update URL immediately for search term
            const urlParams = new URLSearchParams(location.search);
            urlParams.set("searchTerm", e.target.value);
            navigate(`/categories?${urlParams.toString()}`);
        }
        if (e.target.id === "sort") {
            const order = e.target.value || "views";
            setSidebarData({ ...SidebarData, sort: order });
            const urlParams = new URLSearchParams(location.search);
            urlParams.set("sort", order);
            navigate(`/categories?${urlParams.toString()}`);
        }
        if (e.target.id === "category") {
            const category = e.target.value || "uncategorized";
            setSidebarData({ ...SidebarData, category: category });
            const urlParams = new URLSearchParams(location.search);
            urlParams.set("category", category);
            navigate(`/categories?${urlParams.toString()}`);
        }
    };

    const handleShowMore = async () => {
        const numberOfPosts = posts.length;
        const startIndex = numberOfPosts;
        const urlParams = new URLSearchParams(location.search);
        urlParams.set("startIndex", startIndex);
        const searchQuery = urlParams.toString();
        const res = await fetch(`/api/post/getposts?${searchQuery}`);
        if (!res.ok) return;
        const data = await res.json();
        setPosts([...posts, ...data.posts]);
        if (data.posts.length === 9) {
            setShowMore(true);
        } else {
            setShowMore(false);
        }
    };

    const handleRemoveFilters = () => {
        setSidebarData({
            searchTerm: "",
            sort: "views",
            category: "uncategorized",
        });
        navigate("/categories");
    };

    return (
        <div className="min-h-screen max-w-6xl mx-auto px-3 py-8">
            <div className="flex flex-col gap-6 mb-8">
                <h1 className="text-3xl font-semibold text-center">All Posts Categories</h1>
                <p className="text-gray-300 text-center">Explore our posts</p>

                <div className="flex flex-col gap-4 items-center justify-center">
                    <div className="w-full sm:w-[600px]">
                        <TextInput
                            placeholder="Search..."
                            value={SidebarData.searchTerm}
                            onChange={handleChange}
                            id="searchTerm"
                            className="w-full focus:border-blue-500"
                            rightIcon={FaSearch}
                        />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                        <Select
                            onChange={handleChange}
                            value={SidebarData.category}
                            id="category"
                            className="w-full sm:w-[200px] focus:border-blue-500"
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
                        <Select
                            onChange={handleChange}
                            value={SidebarData.sort}
                            id="sort"
                            className="w-full sm:w-[200px] focus:border-blue-500"
                        >
                            <option value="views">Most Views</option>
                            <option value="desc">Latest</option>
                            <option value="asc">Oldest</option>
                        </Select>
                        <Button 
                            onClick={handleRemoveFilters}
                            outline 
                            gradientDuoTone="purpleToPink" 
                            className="w-full sm:w-auto"
                        >
                            Remove Filters
                        </Button>
                    </div>
                </div>
                {!loading && (
                    <p className="text-gray-500 dark:text-gray-400 text-sm text-center">
                        {posts.length === 0 
                            ? "No results found" 
                            : `Showing ${posts.length} ${posts.length === 1 ? 'result' : 'results'}`
                        }
                    </p>
                )}
            </div>

            <div className={`${
                        posts.length === 1
                        ? "flex justify-center"
                        : posts.length === 2
                        ? "flex justify-center gap-6 flex-wrap"
                        : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    }`}
                    >
                {loading ? (
                    <div className="col-span-3 text-center text-xl text-gray-400">Loading...</div>
                ) : (
                    posts.map((post) => <PostCard key={post._id} post={post} />)
                )}
                {
                !loading && posts.length === 0 && (
                    <div className="col-span-3 text-center text-xl text-gray-400">No Results Found.</div>
                ) }
            </div>

            {showMore && !loading && (
                <div className="text-center mt-8">
                    <button onClick={handleShowMore} className="text-teal-500 hover:underline">
                        Show more
                    </button>
                </div>
            )}
        </div>
    );
}
