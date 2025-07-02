import { BrowserRouter as Router, Route, Routes } from "react-router";
import { LoginForm } from "@/components/login-form";
import Home from "./components/home";
import Profil from "./components/profil";
import UserPage from "./components/UserPage";
import PreferencesForms from "./components/ProfileForm/ProfileForm.tsx";
import Error from "./components/Error";
import Globe from "./components/Globe";
import { useAuth } from "./context/auth-context";
import VerifyEmail from './pages/VerifyEmail.tsx';
import ForgotPassword from './pages/ForgotPassword.tsx';
import ResetPassword from './pages/ResetPassword.tsx';
function randomString() {
  return Math.random().toString(36).substring(7);
}
const initialUsers = Array.from({ length: 100 }, (_, i) => ({
  rank: i + 1,
  username: randomString(),
  avatar: `https://robohash.org/${i + 1}.png`,
  points: Math.floor(Math.random() * 10000),
}));

function App() {
  const { user, profileCompleted, loading } = useAuth();
  const isAuth = !!user;
  console.log("isAuth", isAuth, user);
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  if (!isAuth) {
    return (
      <Router>
        <Routes>
          <Route path="*" element={<LoginForm />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

        </Routes>
      </Router>
    );
  }
  console.log("profileCompleted", profileCompleted);
  if (isAuth && user && !profileCompleted) {
    return (
      <Router>
        <Routes>
          <Route path="*" element={<PreferencesForms />} />
        </Routes>
      </Router>
    );
  }

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/globe" element={<Globe />} />
          <Route path="/profile" element={<Profil />} />
          <Route path="/user/:username" element={<UserPage />} />
          {/* <Route path="/verify-email" element={<VerifyEmail />} /> */}
          {/* <Route path="/forgot-password" element={<ForgotPassword />} /> */}
          {/* <Route path="/reset-password" element={<ResetPassword />} /> */}
          <Route path="/*" element={<Error />} />
        </Routes>
      </Router>
      {/* <pre>{JSON.stringify(user, null, 2)}</pre> */}
    </>
  );
}

export default App;
