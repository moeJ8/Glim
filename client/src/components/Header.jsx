import { Navbar, TextInput, Button, Dropdown, Avatar } from "flowbite-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {AiOutlineSearch} from "react-icons/ai"
import {FaMoon, FaSun} from "react-icons/fa"
import { useSelector, useDispatch } from "react-redux";
import { toggleTheme } from "../redux/theme/themeSlice";
import { signoutSuccess } from "../redux/user/userSlice";
import { useEffect, useState, useRef } from "react";
import Logo from "./Logo";
import MobileSearch from "./MobileSearch";
import SearchDropdown from "./SearchDropdown";
import NotificationIcon from "./NotificationIcon";

export default function Header() {
    const path = useLocation().pathname;
    const dispatch = useDispatch();
    const {currentUser} = useSelector((state) => state.user);
    const {theme} = useSelector((state) => state.theme);
    const location = useLocation();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [userResults, setUserResults] = useState([]);
    const [activeTab, setActiveTab] = useState('posts');
    const [showDropdown, setShowDropdown] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showMobileSearch, setShowMobileSearch] = useState(false);
    const dropdownRef = useRef(null);

    const stripHtml = (html) => {
        const tmp = document.createElement('DIV');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    };

    // Close mobile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            const mobileMenuSelectors = [
                '[data-testid="flowbite-navbar-collapse"]',
                '.navbar-collapse',
                '.md\\:hidden.block', 
                'nav div[aria-expanded="true"]'
            ];

            const toggleButtonSelectors = [
                '[data-testid="flowbite-navbar-toggle"]',
                'button[data-collapse-toggle]',
                'button[aria-expanded="true"]',
                '.navbar-toggler'
            ];

            let mobileMenu = null;
            for (const selector of mobileMenuSelectors) {
                const element = document.querySelector(selector);
                if (element && window.getComputedStyle(element).display !== 'none') {
                    mobileMenu = element;
                    break;
                }
            }

            let toggleButton = null;
            for (const selector of toggleButtonSelectors) {
                const element = document.querySelector(selector);
                if (element) {
                    toggleButton = element;
                    break;
                }
            }
            if (mobileMenu && 
                toggleButton && 
                !mobileMenu.contains(event.target) && 
                !toggleButton.contains(event.target)) {
                toggleButton.click();
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

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
        setShowMobileSearch(false);
    }, [location.pathname]);

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
                    const postsRes = await fetch(`/api/post/getposts?searchTerm=${searchTerm}&limit=6`);
                    if (postsRes.ok) {
                        const postsData = await postsRes.json();
                        // Filter results to include posts where either title, content, or category matches
                        const filteredResults = postsData.posts.filter(post => 
                            post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            post.category.toLowerCase().includes(searchTerm.toLowerCase())
                        );
                        setSearchResults(filteredResults);
                    }
                    const usersRes = await fetch(`/api/user/search?username=${searchTerm}&limit=6`);
                    if (usersRes.ok) {
                        const usersData = await usersRes.json();
                        setUserResults(usersData.users);
                    }
                    
                    setShowDropdown(true);
                } catch (error) {
                    console.error('Error fetching search results:', error);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setSearchResults([]);
                setUserResults([]);
                setShowDropdown(false);
                setIsLoading(false);
            }
        };

        const debounceTimer = setTimeout(() => {
            fetchSearchResults();
        }, 200);

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
        if (searchTerm.trim()) {
            const urlParams = new URLSearchParams(location.search);
            urlParams.set('searchTerm', searchTerm);
            const searchQuery = urlParams.toString();
            navigate(`/search?${searchQuery}`);
            setShowDropdown(false);
            setShowMobileSearch(false);
        }
    };

    const handleResultClick = (post) => {
        navigate(`/post/${post.slug}`);
        setShowDropdown(false);
        setSearchTerm("");
    };

    const handleUserClick = (user) => {
        navigate(`/profile/${user.username}`);
        setShowDropdown(false);
        setSearchTerm("");
    };

    return (
        <>
            <Navbar className="border-b-2 sticky top-0 z-50 shadow-md">
                <div className="flex items-center gap-2">
                    <Logo />
                    {/* Mobile dark mode toggle beside logo */}
                    <Button 
                        className="w-10 h-10 md:hidden flex items-center justify-center" 
                        color="gray" 
                        pill 
                        onClick={() => dispatch(toggleTheme())}
                    >
                        <div className="flex items-center justify-center w-full h-full">
                            {theme === "light" ? <FaMoon className="text-lg"/> : <FaSun className="text-lg"/>}
                        </div>
                    </Button>
                </div>
                
                <div className="relative hidden md:block" ref={dropdownRef}>
                    <form onSubmit={handleSubmit}>
                        <TextInput
                            type="text"
                            placeholder="Search posts or users..."
                            rightIcon={AiOutlineSearch}
                            className="w-[300px]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </form>
                    {showDropdown && (
                        <SearchDropdown
                            isLoading={isLoading}
                            searchResults={searchResults}
                            userResults={userResults}
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                            searchTerm={searchTerm}
                            handleResultClick={handleResultClick}
                            handleUserClick={handleUserClick}
                            stripHtml={stripHtml}
                        />
                    )}
                </div>
                
                {/* Centered search button on mobile */}
                <div className="flex-1 flex justify-center md:hidden">
                    <Button 
                        id="mobileSearchToggle"
                        className="w-18 h-10 flex items-center justify-center" 
                        color='gray' 
                        pill
                        onClick={() => setShowMobileSearch(!showMobileSearch)}
                    >
                        <div className="flex items-center justify-center w-full h-full">
                            <AiOutlineSearch className="text-lg"/>
                        </div>
                    </Button>
                </div>
                
                <div className="flex gap-2 md:order-2">
                    {/* Desktop theme toggle */}
                    <Button className="w-12 h-10 hidden md:inline-flex items-center justify-center" color="gray" pill onClick={() => dispatch(toggleTheme())}>
                        <div className="flex items-center justify-center w-full h-full">
                            {theme === "light" ? <FaMoon className="text-md"/> : <FaSun className="text-md"/>}
                        </div>
                    </Button>

                    {/* Notification icon - only show for logged in users */}
                    {currentUser && <NotificationIcon />}

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
                            <Link to='/notifications'>
                                <Dropdown.Item>Notifications</Dropdown.Item>
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
                    <Navbar.Link active={path === "/stories"} as={'div'}>
                        <Link to="/stories">
                            <p className="dark:text-teal-400 text-indigo-800">
                                Narratives
                            </p>
                        </Link>
                    </Navbar.Link>
                </Navbar.Collapse>
            </Navbar>
            {/* Mobile search component */}
            <MobileSearch 
                showMobileSearch={showMobileSearch}
                setShowMobileSearch={setShowMobileSearch}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                searchResults={searchResults}
                userResults={userResults}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                setShowDropdown={setShowDropdown}
                isLoading={isLoading}
                handleSubmit={handleSubmit}
                stripHtml={stripHtml}
            />
        </>
    );
}
