import { Link, useNavigate } from "react-router-dom";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../firebase/auth.js";
import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";

const provider = new GoogleAuthProvider();
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function LandingNavbar() {
  const navigate = useNavigate();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const idToken = await user.getIdToken();
      await axios.post(
        BACKEND_URL + "/auth/login",
        { idToken: idToken },
        { withCredentials: true }
      );
      navigate("/dashboard");
    } catch (e) {
      if (e.code === "auth/popup-closed-by-user") {
        setIsLoggingIn(false);
      } else {
        console.error("Login Error:", e);
        toast.error(`Login failed: ${e.response?.data?.msg || e.message}`);
        setIsLoggingIn(false);
      }
    }
  };

  return (
    <div className="bg-[#FDFBF7]/90 backdrop-blur-md sticky top-0 z-50 border-b border-[#192E46]/10 w-full h-[5rem] flex items-center justify-between px-8 md:px-16">
      <Link to="/">
        <img src="../../logo.png" alt="logo" className="w-[10rem]" />
      </Link>
      <button
        onClick={handleLogin}
        disabled={isLoggingIn}
        className="px-6 py-2.5 bg-[#192E46] text-white rounded-full font-semibold shadow-md hover:shadow-lg hover:bg-[#DBC6AE] hover:text-[#192E46] hover:scale-105 transition-all duration-300 border-2 border-transparent hover:border-[#192E46]/10 flex items-center gap-2 text-sm tracking-wide cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isLoggingIn ? "Signing in..." : "Try EchoCare!"}
      </button>
    </div>
  );
}

export default LandingNavbar;
