import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../firebase/auth.js";
import axios from "axios";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const provider = new GoogleAuthProvider();

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function Hero() {
  const navigate=useNavigate();

  const handleLogin = async () => {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const email = user.email;
    const name = user.displayName;
    try {
      await axios.post(
        BACKEND_URL + "/auth/login",
        {
          email: email,
          name: name,
        },
        {
          withCredentials: true,
        }
      );
      navigate("/dashboard");
    } catch (e) {
      console.log(e);
    }
  };
  
  return (
    <div className="h-fit py-30 bg-[#F5F6FB] flex flex-col items-center justify-center gap-7">
      <h1 className="text-[2rem] font-semibold text-center mx-5 mt-3">
        <span className="text-[#285B95]">AI-powered clinical notes. </span>
        <span className="text-[#16365D]">Without the paperwork</span>
      </h1>
      <h2 className="text-[#484F66] text-[1.3rem] text-center max-w-[50rem] mx-3">
        EchoCare records doctor-patient conversation and converts them into
        structured SOAP notes - ready to review and export
      </h2>
      <button
        className="flex items-center text-[1.1rem] gap-3 bg-[#3570BD] px-6 py-2 text-white rounded-lg hover:opacity-85 cursor-pointer"
        onClick={handleLogin}
      >
        <span className="mt-[0.1rem]">
          <i className="devicon-google-plain"></i>
        </span>
        <span>Continue with Google</span>
      </button>
    </div>
  );
}

export default Hero;
