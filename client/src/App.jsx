import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'
import { registerServiceWorker } from './services/pushNotificationService'

import Home from './pages/Home'
import About from './pages/About'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import Categories from './pages/Categories'
import Dashboard from './pages/Dashboard'
import Header from './components/Header'
import Footer from './components/Footer'
import PrivateRoute from './components/PrivateRoute'
import OnlyAdminPrivateRoute from './components/OnlyAdminPrivateRoute'
import CreatePost from './pages/CreatePost'
import UpdatePost from './pages/UpdatePost'
import PostPage from './pages/PostPage'
import ScrollToTop from './components/ScrollToTop'
import ScrollToTopArrow from './components/ScrollToTopArrow'
import Search from './pages/Search'
import Stories from './pages/Stories'
import StoryPage from './pages/StoryPage'
import CreateStory from './pages/CreateStory'
import UpdateStory from './pages/UpdateStory'
import Donate from './pages/Donate'
import DonateCase from './pages/DonateCase'
import DonateSuccess from './pages/DonateSuccess'
import CreateDonation from './pages/CreateDonation'
import DonationDashboard from './pages/DonationDashboard'
import EditDonation from './pages/EditDonation.jsx'
import UserProfile from './pages/UserProfile'
import Notifications from './pages/Notifications'
import EmailVerification from './pages/EmailVerification'
import RequestPasswordReset from './pages/RequestPasswordReset'
import ResetPassword from './pages/ResetPassword'
import NotFound from './pages/NotFound'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsConditions from './pages/TermsConditions'
import SessionExpiredNotification from './components/SessionExpiredNotification'


export default function App() {
  // Register service worker for push notifications
  useEffect(() => {
    const registerSW = async () => {
      try {
        if ('serviceWorker' in navigator) {
          await registerServiceWorker();
        }
      } catch (error) {
        console.error('Failed to register service worker:', error);
      }
    };

    registerSW();
  }, []);

  return (
    <div className="overflow-x-hidden">
      {/* Toast notifications */}
      <Toaster position="bottom-center" />
      
      {/* Session Expired Notification */}
      <SessionExpiredNotification />
      
      <BrowserRouter>
      <ScrollToTop/>
      <Header/>
      <Routes>
      <Route path="/" element={<Home/>}/>
      <Route path="/about" element={<About/>}/>
      <Route path="/sign-in" element={<SignIn/>}/>
      <Route path="/sign-up" element={<SignUp/>}/>
      <Route path="/search" element={<Search/>}/>
      <Route path="/stories" element={<Stories/>}/>
      <Route path="/narrative/:slug" element={<StoryPage/>}/>
      <Route path="/donate" element={<Donate/>}/>
      <Route path="/donate/:id" element={<DonateCase/>}/>
      <Route path="/donate/success" element={<DonateSuccess/>}/>
      <Route path="/profile/:username" element={<UserProfile/>}/>
      <Route path="/users/:userId/verify/:token" element={<EmailVerification/>}/>
      <Route path="/request-password-reset" element={<RequestPasswordReset/>}/>
      <Route path="/reset-password/:userId/:token" element={<ResetPassword/>}/>
      <Route path="/privacy-policy" element={<PrivacyPolicy/>}/>
      <Route path="/terms-conditions" element={<TermsConditions/>}/>
      <Route element={<PrivateRoute/>} >
        <Route path="/dashboard" element={<Dashboard/>}/>
        <Route path="/notifications" element={<Notifications/>}/>
      </Route>
      <Route element={<OnlyAdminPrivateRoute/>} >
        <Route path="/create-post" element={<CreatePost/>}/>
        <Route path="/update-post/:postId" element={<UpdatePost/>}/>
        <Route path="/create-donation" element={<CreateDonation/>}/>
        <Route path="/donation-dashboard" element={<DonationDashboard/>}/>
        <Route path="/create-narrative" element={<CreateStory/>}/>
        <Route path="/update-narrative/:storyId" element={<UpdateStory/>}/>
      </Route>
      <Route path="/posts" element={<Categories/>}/>
      <Route path="/post/:postSlug" element={<PostPage/>}/>
      <Route path='/edit-donation/:id' element={<EditDonation />} />
      
      {/* Catch-all route for 404 Not Found page */}
      <Route path="*" element={<NotFound />} />
  
      </Routes>
      <ScrollToTopArrow />
      <Footer/>
      </BrowserRouter>
    </div>
  )
}
