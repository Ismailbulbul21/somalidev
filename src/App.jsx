import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './utils/AuthContext'
import { MessagesProvider } from './utils/MessagesContext'
import MainLayout from './components/layout/MainLayout'
import './App.css'

// Pages
import Home from './pages/Home'
import Developers from './pages/Developers'
import Profile from './pages/Profile'
import ProfileEdit from './pages/ProfileEdit'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import Dashboard from './pages/Dashboard'
import Messages from './pages/Messages'
import NotFound from './pages/NotFound'
import AuthCallback from './pages/AuthCallback'
import CompleteProfile from './pages/CompleteProfile'

const App = () => {
  return (
    <AuthProvider>
      <MessagesProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/complete-profile" element={<CompleteProfile />} />
            
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Home />} />
              <Route path="developers" element={<Developers />} />
              <Route path="profile/edit" element={<ProfileEdit />} />
              <Route path="profile/:id" element={<Profile />} />
              <Route path="profile" element={<Profile />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="messages/:id" element={<Messages />} />
              <Route path="messages" element={<Messages />} />
              <Route path="signin" element={<SignIn />} />
              <Route path="signup" element={<SignUp />} />
              <Route path="404" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </MessagesProvider>
    </AuthProvider>
  )
}

export default App
