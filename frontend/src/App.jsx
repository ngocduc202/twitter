import { Navigate, Route, Routes } from "react-router-dom"
import HomePage from "./pages/home/HomePage"
import LoginPage from "./pages/auth/login/LoginPage"
import SignUpPage from "./pages/auth/signup/SignUpPage"
import Sidebar from "./components/commom/SideBar"
import RightPanel from "./components/commom/RightPanel"
import NotificationPage from "./pages/notification/NotificationPage"
import ProfilePage from "./pages/profile/ProfilePage"
import { Toaster } from "react-hot-toast"
import { useQuery } from "@tanstack/react-query"
import LoadingSpinner from "./components/commom/LoadingSpinner"
import NavMobile from "./components/commom/NavMobile"
import Search from "./pages/search/Search"
import Following from "./components/commom/Following"
import Followers from "./components/commom/Followers"


function App() {
  const { isLoading, data: authUser } = useQuery({
    queryKey: ['authUser'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/auth/me')
        const data = await res.json()
        if (data.error) return null
        if (!res.ok) throw new Error(data.error || 'Something went wrong')
        return data
      } catch (error) {
        throw new Error(error)
      }
    },
    retry: false
  })

  if (isLoading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }
  return (
    <div className='flex max-w-6xl mx-auto pb-10 md:pb-0'>
      <div className="hidden md:flex">
        {authUser && <Sidebar />}
      </div>
      <div className=" block md:hidden">
        {authUser && <NavMobile />}
      </div>
      <Routes>
        <Route path='/' element={authUser ? <HomePage /> : <Navigate to="/login" />} />
        <Route path='/login' element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
        <Route path='/signup' element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
        <Route path='/notifications' element={authUser ? <NotificationPage /> : <Navigate to="/login" />} />
        <Route path='/search' element={authUser ? <Search /> : <Navigate to="/login" />} />
        <Route path='/profile/:username' element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
        <Route path='/following' element={authUser ? <Following /> : <Navigate to="/login" />} />
        <Route path='/followers' element={authUser ? <Followers /> : <Navigate to="/login" />} />
      </Routes>
      {authUser && <RightPanel />}
      <Toaster />
    </div>
  )
}

export default App
