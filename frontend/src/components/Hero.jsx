import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../firebase/auth.js";
import axios from "axios";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const provider = new GoogleAuthProvider();

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function Hero() {
  const navigate = useNavigate();

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
    <div className="min-h-[80vh] py-20 bg-gradient-to-b from-blue-50/50 to-white flex flex-col items-center justify-center gap-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] pointer-events-none"></div>
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-center mx-5 mt-3 leading-tight tracking-tight">
        <span className="text-slate-800">AI-powered clinical notes. </span>
        <br className="hidden md:block" />
        <span className="text-blue-600">
          Without the{" "}
          <span className="text-green-600 font-['Homemade_Apple']">
            paperwork
          </span>
        </span>
      </h1>
      <h2 className="text-slate-600 text-lg md:text-xl text-center max-w-2xl mx-3 font-medium">
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
        <span className="font-medium">Continue with Google</span>
      </button>
    </div>
  );
}

export default Hero;
