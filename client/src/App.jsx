import { useContext } from "react";
import { AuthContext } from "./context/authContext";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ChatPage from "./pages/ChatPage";
import OnboardingPage from "./pages/OnboardingPage";
import ProfilePage from "./pages/ProfilePage";

function App() {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="flex items-center w-full justify-center h-screen bg-neutral-900 text-gray-500">Loading...</div>;

  return (
    <AnimatePresence mode="wait">
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              !user ? (
                <Navigate to="/login" />
              ) : !user.isOnboarded ? (
                <Navigate to="/onboard" />
              ) : (
                <ChatPage />
              )
            }
          />
          <Route
            path="/login"
            element={user ? <Navigate to="/" /> : <LoginPage />}
          />
          <Route
            path="/onboard"
            element={
              user && !user.isOnboarded ? (
                <OnboardingPage />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/profile"
            element={!user ? <Navigate to="/login" /> : <ProfilePage />}
          />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </Router>
    </AnimatePresence>
  );
}

export default App;
