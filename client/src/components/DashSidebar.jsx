import { Sidebar } from "flowbite-react";
import { HiUser, HiArrowSmRight, HiDocumentText, HiOutlineUserGroup, HiAnnotation, HiChartPie, HiInboxIn, HiExclamation } from "react-icons/hi";
import { FaBookOpen, FaList } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { signoutSuccess } from "../redux/user/userSlice";
import { useDispatch, useSelector } from "react-redux";
import { setPendingRequests } from "../redux/request/requestSlice";
import { setPendingReports } from "../redux/report/reportSlice";
import PropTypes from 'prop-types';

// Mobile-specific navigation item component
const MobileNavItem = ({ to, icon: Icon, active, badge, onClick }) => (
  <div className="flex-shrink-0 relative">
    {onClick ? (
      <button 
        onClick={onClick}
        className={`p-4 flex justify-center items-center ${active ? 'text-blue-600 dark:text-blue-500' : 'text-gray-600 dark:text-gray-400'}`}
      >
        <Icon className="w-6 h-6" />
      </button>
    ) : (
      <Link to={to} className="block">
        <div className={`p-4 flex justify-center items-center ${active ? 'text-blue-600 dark:text-blue-500' : 'text-gray-600 dark:text-gray-400'}`}>
          <Icon className="w-6 h-6" />
          {badge > 0 && (
            <span className="absolute top-1 right-1 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full">
              {badge}
            </span>
          )}
        </div>
      </Link>
    )}
  </div>
);

// Add prop types validation for MobileNavItem
MobileNavItem.propTypes = {
  to: PropTypes.string,
  icon: PropTypes.elementType.isRequired,
  active: PropTypes.bool,
  badge: PropTypes.number,
  onClick: PropTypes.func
};

// Set default props
MobileNavItem.defaultProps = {
  active: false,
  badge: 0
};

export default function DashSidebar() {
  const location = useLocation();
  const dispatch = useDispatch();
  const {currentUser} = useSelector((state) => state.user);
  const {pendingRequests} = useSelector((state) => state.request);
  const {pendingReports} = useSelector((state) => state.report);
  const [tab, setTab] = useState('');
  const [pendingStories, setPendingStories] = useState(0);
  const [totalPendingRequests, setTotalPendingRequests] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Handle window resize to detect mobile state
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get('tab');
    if(tabFromUrl) {
      setTab(tabFromUrl)
    }
  }, [location.search])

  useEffect(() => {
    const fetchPendingRequests = async () => {
      try {
        const res = await fetch('/api/user/publisher-requests/get?status=pending', {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
        });
        const data = await res.json();
        if (res.ok) {
          dispatch(setPendingRequests(data.totalRequests));
        }
      } catch (error) {
        console.log(error.message);
      }
    };

    if (currentUser && currentUser.isAdmin) {
      fetchPendingRequests();
      // Set up polling every 30 seconds
      const interval = setInterval(fetchPendingRequests, 30000);
      return () => clearInterval(interval);
    }
  }, [currentUser, dispatch]);

  useEffect(() => {
    const fetchPendingReports = async () => {
      try {
        const res = await fetch('/api/report?status=pending&page=1&limit=1', {
          credentials: 'include'
        });
        const data = await res.json();
        if (res.ok) {
          dispatch(setPendingReports(data.totalReports));
        }
      } catch (error) {
        console.log(error.message);
      }
    };

    if (currentUser && currentUser.isAdmin) {
      fetchPendingReports();
      // Set up polling every 30 seconds
      const interval = setInterval(fetchPendingReports, 30000);
      return () => clearInterval(interval);
    }
  }, [currentUser, dispatch]);

  useEffect(() => {
    // Fetch pending stories count for admin
    const fetchPendingStories = async () => {
      try {
        const res = await fetch('/api/story/counts');
        const data = await res.json();
        
        if (res.ok) {
          const newPendingStories = data.pendingStories;
          setPendingStories(newPendingStories);
          // Calculate total pending requests
          setTotalPendingRequests(pendingRequests + newPendingStories);
        }
      } catch (error) {
        console.log(error.message);
      }
    };
    
    if (currentUser && currentUser.isAdmin) {
      fetchPendingStories();
      // Set up polling every 30 seconds
      const interval = setInterval(fetchPendingStories, 30000);
      return () => clearInterval(interval);
    }
  }, [currentUser, pendingRequests]);

  const handleSignOut = async () => {
    try{
      const res = await fetch('api/user/signout',{
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

  return (
    <>
      {/* Mobile Sidebar */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg">
          <div className="flex overflow-x-auto py-1 no-scrollbar">
            {/* Dashboard - Admin only */}
            {currentUser && currentUser.isAdmin && (
              <MobileNavItem 
                to="/dashboard?tab=dashboard" 
                icon={HiChartPie} 
                active={tab === 'dashboard' || !tab} 
              />
            )}
            
            {/* Profile - Everyone */}
            <MobileNavItem 
              to="/dashboard?tab=profile" 
              icon={HiUser} 
              active={tab === 'profile'} 
            />
            
            {/* Posts tab for both admin and publisher */}
            {(currentUser.isAdmin || currentUser.isPublisher) && (
              <MobileNavItem 
                to="/dashboard?tab=posts" 
                icon={HiDocumentText} 
                active={tab === 'posts'} 
              />
            )}
            
            {/* Stories tab for admins and publishers */}
            {(currentUser.isAdmin || currentUser.isPublisher) && (
              <MobileNavItem 
                to="/dashboard?tab=narratives" 
                icon={FaBookOpen} 
                active={tab === 'narratives'} 
              />
            )}
            
            {/* All Stories tab (admin only) */}
            {currentUser.isAdmin && (
              <MobileNavItem 
                to="/dashboard?tab=allnarratives" 
                icon={FaList} 
                active={tab === 'allnarratives'} 
              />
            )}
            
            {/* Users tab (admin only) */}
            {currentUser.isAdmin && (
              <MobileNavItem 
                to="/dashboard?tab=users" 
                icon={HiOutlineUserGroup} 
                active={tab === 'users'} 
              />
            )}
            
            {/* Comments tab for both admin and publisher */}
            {(currentUser.isAdmin || currentUser.isPublisher) && (
              <MobileNavItem 
                to="/dashboard?tab=comments" 
                icon={HiAnnotation} 
                active={tab === 'comments'} 
              />
            )}
            
            {/* Requests - Admin only */}
            {currentUser.isAdmin && (
              <MobileNavItem 
                to="/dashboard?tab=requests" 
                icon={HiInboxIn} 
                active={tab === 'requests'} 
                badge={totalPendingRequests}
              />
            )}
            
            {/* Reports - Admin only */}
            {currentUser.isAdmin && (
              <MobileNavItem 
                to="/dashboard?tab=reports" 
                icon={HiExclamation} 
                active={tab === 'reports'} 
                badge={pendingReports}
              />
            )}
            
            {/* Sign Out button */}
            <MobileNavItem 
              icon={HiArrowSmRight} 
              onClick={handleSignOut} 
            />
          </div>
        </div>
      )}
      
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Sidebar className="w-full md:w-56">
          <Sidebar.Items>
            <Sidebar.ItemGroup className="flex flex-col gap-1">
                {
                  currentUser && currentUser.isAdmin && (
                  <Link to={`/dashboard?tab=dashboard`}>
                    <Sidebar.Item active={tab==='dashboard' || !tab} icon={HiChartPie} as='div'>
                      Dashboard
                    </Sidebar.Item>
                    </Link>
                )}
                <Link to={`/dashboard?tab=profile`}>
                  <Sidebar.Item active={tab === 'profile'} icon={HiUser}
                  label={currentUser.isAdmin ? 'Admin' : currentUser.isPublisher ? 'Publisher' : 'User'} 
                  labelColor='dark' as='div'>
                    Profile
                  </Sidebar.Item>
              </Link>
              {/* Posts tab for both admin and publisher */}
              {(currentUser.isAdmin || currentUser.isPublisher) && (
                <Link to={`/dashboard?tab=posts`}>
                  <Sidebar.Item active = {tab === 'posts'} icon={HiDocumentText} as='div'>
                    Posts
                  </Sidebar.Item>
                </Link>
              )}
              {/* All Stories tab (admin only) */}
              {currentUser.isAdmin && (
                <Link to={`/dashboard?tab=allnarratives`}>
                  <Sidebar.Item active={tab === 'allnarratives'} icon={FaList} as='div'>
                    All Narratives
                  </Sidebar.Item>
                </Link>
              )}
              {/* Stories tab for admins and publishers */}
              {(currentUser.isAdmin || currentUser.isPublisher) && (
                <Link to={`/dashboard?tab=narratives`}>
                  <Sidebar.Item active={tab === 'narratives'} icon={FaBookOpen} as='div'>
                    Narratives
                  </Sidebar.Item>
                </Link>
              )}
              {/* Comments tab for admin */}
              {currentUser.isAdmin && (
                <>
                  <Link to={`/dashboard?tab=users`}>
                    <Sidebar.Item active = {tab === 'users'} icon={HiOutlineUserGroup} as='div'>
                        Users
                    </Sidebar.Item>
                  </Link>
                  <Link to={`/dashboard?tab=comments`}>
                    <Sidebar.Item active = {tab === 'comments'} icon={HiAnnotation} as='div'>
                        Comments
                    </Sidebar.Item>
                  </Link>
                  <Link to={`/dashboard?tab=requests`}>
                    <Sidebar.Item active={tab === 'requests'} icon={HiInboxIn} as='div'>
                      Requests
                      {(pendingRequests > 0 || pendingStories > 0) && (
                        <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                          {totalPendingRequests}
                        </span>
                      )}
                    </Sidebar.Item>
                  </Link>
                  <Link to={`/dashboard?tab=reports`}>
                    <Sidebar.Item active={tab === 'reports'} icon={HiExclamation} as='div'>
                      Reports
                      {pendingReports > 0 && (
                        <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                          {pendingReports}
                        </span>
                      )}
                    </Sidebar.Item>
                  </Link>
                </>
              )}
              {/* Comments tab for publisher */}
              {currentUser.isPublisher && !currentUser.isAdmin && (
                <Link to={`/dashboard?tab=comments`}>
                  <Sidebar.Item active = {tab === 'comments'} icon={HiAnnotation} as='div'>
                      Comments
                  </Sidebar.Item>
                </Link>
              )}
              
              <Sidebar.Item icon={HiArrowSmRight} className='cursor-pointer' onClick={handleSignOut} as='div'>
                Sign Out
              </Sidebar.Item>
            </Sidebar.ItemGroup>
          </Sidebar.Items>
        </Sidebar>
      )}
    </>
  )
}
