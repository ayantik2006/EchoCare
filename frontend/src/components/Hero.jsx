import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../firebase/auth.js";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";

const provider = new GoogleAuthProvider();

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function Hero() {
  const navigate = useNavigate();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async () => {
    console.log("BACKEND_URL:", BACKEND_URL);
    setIsLoggingIn(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const idToken = await user.getIdToken();
      await axios.post(
        BACKEND_URL + "/auth/login",
        {
          idToken: idToken
        },
        {
          withCredentials: true,
        }
      );
      navigate("/dashboard");
    } catch (e) {
      if (e.code === "auth/popup-closed-by-user") {
        setIsLoggingIn(false);
      }
      else {
        console.error("Login Error:", e);
        if (e.response && e.response.data) {
          console.error("Response Data:", e.response.data);
        }
        toast.error(`Login failed: ${e.response?.data?.msg || e.message}`);
      }
    }
  };

  return (
    <div className="min-h-[80vh] py-20 bg-gradient-to-b from-[#FFFCF5] to-white flex flex-col items-center justify-center gap-8 relative overflow-hidden">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] pointer-events-none"></div>
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-center mx-5 mt-3 leading-tight tracking-tight">
        <span className="text-slate-800">AI-powered clinical notes. </span>
        <br className="hidden md:block" />
        <span className="text-blue-600">
          Without the{" "}
          <span className="text-green-600 font-['Homemade_Apple'] relative inline-block">
            paperwork
            <svg className="absolute w-[120%] h-6 -bottom-2 -left-[10%] pointer-events-none -rotate-1" viewBox="0 0 100 25" preserveAspectRatio="none">
              <path d="M5 18 Q 50 2 95 18" stroke="black" strokeWidth="4" fill="none" strokeLinecap="round" />
            </svg>
          </span>
        </span>
      </h1>
      <h2 className="text-slate-600 text-lg md:text-xl text-center max-w-2xl mx-3 font-medium">
        EchoCare records doctor-patient conversation and converts them into
        structured SOAP notes - ready to review and export
      </h2>
      <button
        className={`flex items-center text-[1.1rem] gap-3 bg-orange-500 px-6 py-2 text-white rounded-lg hover:opacity-85 cursor-pointer ${isLoggingIn ? "opacity-75 pointer-events-none" : ""
          }`}
        onClick={handleLogin}
      >
        <span className="mt-[0.1rem]">
          {!isLoggingIn && <i className="devicon-google-plain"></i>}
          {isLoggingIn && (
            <div className="border-r-4 w-4 h-4 rounded-full animate-spin"></div>
          )}
        </span>
        <span className="font-medium">
          {!isLoggingIn ? "Continue with Google" : "Logging you in..."}
        </span>
      </button>
    </div>
  );
}

export default Hero;
