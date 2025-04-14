import { Navbar, TextInput, Button, Dropdown, Avatar, Spinner } from "flowbite-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {AiOutlineSearch} from "react-icons/ai"
import {FaMoon, FaSun} from "react-icons/fa"
import { useSelector, useDispatch } from "react-redux";
import { toggleTheme } from "../redux/theme/themeSlice";
import { signoutSuccess } from "../redux/user/userSlice";
import { useEffect, useState, useRef } from "react";
import Logo from "./Logo";

export default function Header() {
    const path = useLocation().pathname;
    const dispatch = useDispatch();
    const {currentUser} = useSelector((state) => state.user);
    const {theme} = useSelector((state) => state.theme);
    const location = useLocation();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const dropdownRef = useRef(null);

    const stripHtml = (html) => {
        const tmp = document.createElement('DIV');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const searchTermFromUrl = urlParams.get('searchTerm');
        if(searchTermFromUrl) {
            setSearchTerm(searchTermFromUrl);
        }
    }, [location.search])

    useEffect(() => {
        const fetchSearchResults = async () => {
            if (searchTerm.length > 2) {
                setIsLoading(true);
                try {
                    const res = await fetch(`/api/post/getposts?searchTerm=${searchTerm}&limit=6`);
                    if (res.ok) {
                        const data = await res.json();
                        // Filter results to include posts where either title, content, or category matches
                        const filteredResults = data.posts.filter(post => 
                            post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            post.category.toLowerCase().includes(searchTerm.toLowerCase())
                        );
                        setSearchResults(filteredResults);
                        setShowDropdown(true);
                    }
                } catch (error) {
                    console.error('Error fetching search results:', error);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setSearchResults([]);
                setShowDropdown(false);
                setIsLoading(false);
            }
        };

        const debounceTimer = setTimeout(() => {
            fetchSearchResults();
        }, 150);

        return () => clearTimeout(debounceTimer);
    }, [searchTerm]);

    const handleSignOut = async () => {
        try{
          const res = await fetch('/api/user/signout',{
            method: 'POST',
          });
          const data = await res.json();
          if(!res.ok) {
            console.log(data.message)
          }else{
            dispatch(signoutSuccess());
          }
        } catch(error) {
          console.log(error.message)
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const urlParams = new URLSearchParams(location.search);
        urlParams.set('searchTerm', searchTerm);
        const searchQuery = urlParams.toString();
        navigate(`/search?${searchQuery}`);
        setShowDropdown(false);
    };

    const handleResultClick = (post) => {
        navigate(`/post/${post.slug}`);
        setShowDropdown(false);
        setSearchTerm("");
    };

    return (
        <Navbar className="border-b-2 sticky top-0 z-50 shadow-md">
            <Logo />
            <div className="relative hidden md:block" ref={dropdownRef}>
                <form onSubmit={handleSubmit}>
                    <TextInput
                        type="text"
                        placeholder="Search posts or categories..."
                        rightIcon={AiOutlineSearch}
                        className="w-[300px]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </form>
                {showDropdown && (
                    <div className="absolute top-full left-0 w-[300px] mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-[400px] overflow-y-auto">
                        {isLoading ? (
                            <div className="flex justify-center items-center p-4">
                                <Spinner size="sm" />
                            </div>
                        ) : searchResults.length > 0 ? (
                            searchResults.map((post) => (
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
                                        <span className={`px-2 py-1 rounded-full text-xs ${
                                            post.category.toLowerCase() === searchTerm.toLowerCase() 
                                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                        }`}>
                                            {post.category}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : searchTerm.length > 2 && (
                            <div className="p-3 text-center text-gray-500 dark:text-gray-400">
                                No results found
                            </div>
                        )}
                    </div>
                )}
            </div>
            <Link to={"/search"}>
                <Button className="w-12 h-10 md:hidden" color='gray' pill>
                    <AiOutlineSearch/>
                </Button>
            </Link>
            <div className="flex gap-2 md:order-2">
                <Button className="w-12 h-10 sm:inline" color="gray" pill onClick={() => dispatch(toggleTheme())}>
                    {theme === "light" ? <FaMoon className="text-md"/> : <FaSun/>}
                </Button>

                {currentUser ? (
                    <Dropdown 
                        arrowIcon={false}
                        inline
                        label={
                            <Avatar
                                alt="user"
                                img={currentUser.profilePicture}
                                rounded
                            />
                        }
                    >
                        <Dropdown.Header>
                            <span className="block text-sm"> @{currentUser.username} </span>
                            <span className="block text-sm font-medium truncate"> {currentUser.email} </span>
                        </Dropdown.Header>
                        <Link to={'/dashboard?tab=profile'}>
                            <Dropdown.Item>Profile</Dropdown.Item>
                        </Link>
                        <Dropdown.Divider />
                        <Dropdown.Item onClick={handleSignOut}>Sign out</Dropdown.Item>
                    </Dropdown>
                ) : (
                    <Link to="/sign-in">
                        <Button gradientDuoTone="purpleToBlue" outline>
                            Sign In
                        </Button>
                    </Link>
                )}
                
                <Navbar.Toggle />
            </div>

            <Navbar.Collapse>
                <Navbar.Link active={path === "/"} as={'div'}>
                    <Link to="/">
                        Home
                    </Link>
                </Navbar.Link>

                <Navbar.Link active={path === "/about"} as={'div'}>
                    <Link to="/about">
                        About
                    </Link>
                </Navbar.Link>

                <Navbar.Link active={path === "/categories"} as={'div'}>
                    <Link to="/categories">
                        Categories
                    </Link>
                </Navbar.Link>
                <Navbar.Link active={path === "/donate"} as={'div'}>
                    <Link to="/donate">
                        <p className="dark:text-teal-400 text-indigo-800">
                            Donate Now
                        </p>
                    </Link>
                </Navbar.Link>
            </Navbar.Collapse>
        </Navbar>
    );
}
