import { Route, Routes } from "react-router-dom";
import Header from "./pages/header/Header";
import Login from "./pages/auth/login/Login";
import Signup from "./pages/auth/signup/Signup";
import Dashboard from "./pages/dashboard/Dashboard";
import UserPage from './pages/user/UserPage';
import EditProfile from "./components/EditProfile/EditProfile";
import ResumeToProfile from "./components/EditProfile/ResumeToProfile"
import ThankYouPage from "./components/EditProfile/ThankYouPage";



function App() {
  return (
    <>
      <Header>"HI"</Header>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/user/:id" element={<UserPage />} />
        <Route path="/user/:id/edit" element={<EditProfile />} />
        <Route path="/generate" element={<ResumeToProfile />} />
        <Route path="/" element={<ThankYouPage />} />
      </Routes>
    </>
  );
}

export default App;
