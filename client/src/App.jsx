import { BrowserRouter, Routes, Route } from 'react-router-dom'

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


export default function App() {
  return (
    <div>
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
      <Route path="/categories" element={<Categories/>}/>
      <Route path="/post/:postSlug" element={<PostPage/>}/>
      <Route path='/edit-donation/:id' element={<EditDonation />} />
      
      {/* Catch-all route for 404 Not Found page */}
      <Route path="*" element={<NotFound />} />
  
      </Routes>
      <Footer/>
      </BrowserRouter>
    </div>
  )
}
