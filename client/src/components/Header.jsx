import { Navbar, TextInput, Button, Dropdown, Avatar } from "flowbite-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {AiOutlineSearch} from "react-icons/ai"
import {FaMoon, FaSun} from "react-icons/fa"
import { useSelector, useDispatch } from "react-redux";
import { toggleTheme } from "../redux/theme/themeSlice";
import { signoutSuccess } from "../redux/user/userSlice";
import { useEffect, useState } from "react";
import Logo from "./Logo";

export default function Header() {
    const path = useLocation().pathname;
    const dispatch = useDispatch();
    const {currentUser} = useSelector((state) => state.user);
    const {theme} = useSelector((state) => state.theme);
    const location = useLocation();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const searchTermFromUrl = urlParams.get('searchTerm');
        if(searchTermFromUrl) {
            setSearchTerm(searchTermFromUrl);
        }
    }, [location.search])

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
      };
  return (
    <Navbar className="border-b-2 sticky top-0 z-50 shadow-md">
        <Logo />
        <form onSubmit={handleSubmit}>
            <TextInput
                type="text"
                placeholder="Search..."
                rightIcon={AiOutlineSearch}
                className="hidden md:inline"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </form>
        <Link to={"/search"}>
            <Button className="w-12 h-10  md:hidden"color='gray' pill>
                <AiOutlineSearch/>
            </Button>
        </Link>
        <div className="flex gap-2 md:order-2">
            <Button className="w-12 h-10 sm:inline" color="gray" pill onClick={() => dispatch(toggleTheme())}>
                {theme === "light" ? <FaMoon className="text-md"/> : <FaSun/>}
            </Button>

            {currentUser ? (
                <Dropdown 
                    arrowIcon = {false}
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
            ):
            (
                <Link to="/sign-in">
                    <Button gradientDuoTone="purpleToBlue" outline>
                        Sign In
                    </Button>
            </Link>
            )    
        }
            
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
  )
}
