import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom"
import DashSidebar from "../components/DashSidebar";
import DashProfile from "../components/DashProfile";
import DashPosts from "../components/DashPosts";
import DashUsers from "../components/DashUsers";
import DashComments from "../components/DashComments";
import DashboardComp from "../components/DashboardComp";
import DashRequests from "../components/DashRequests";
import DashReports from "../components/DashReports";
import DashStories from "../components/DashStories";
import DashAllStories from "../components/DashAllStories";

export default function Dashboard() {
const location = useLocation();
const [tab, setTab] = useState('');
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

  return (
    <div className={`min-h-screen flex flex-col md:flex-row ${isMobile ? 'pb-16' : ''}`}>
      <div className="md:w-56">
        {/* Sidebar */}
        <DashSidebar />
      </div>
      {/* Profile... */}
      {tab === 'profile' && <DashProfile/>}
      {/* Posts... */}
      {tab === 'posts' && <DashPosts/>}
      {/* Users */}
      {tab === 'users' && <DashUsers/>}
      {/* Comments */}
      {tab === 'comments' && <DashComments/>}
      {/* Dashboard */}
      {tab === 'dashboard' && <DashboardComp/>}
      {/* Requests - now includes both publisher and story requests */}
      {tab === 'requests' && <DashRequests/>}
      {/* Reports */}
      {tab === 'reports' && <DashReports/>}
      {/* My Narratives */}
      {tab === 'narratives' && <DashStories/>}
      {/* All Narratives (for admin) */}
      {tab === 'allnarratives' && <DashAllStories/>}
    </div>
  )
}
