import LandingNavbar from "./LandingNavbar";
import Hero from "./Hero";
import Features from "./Features";
import Working from "./Working";
import Security from "./Security";
import Footer from "./Footer";
import { useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function Landing() {
  const navigate = useNavigate();

  useEffect(() => {
    // Scroll to top on reload/mount
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

    axios.post(BACKEND_URL + "/auth/check-login", {}, { withCredentials: true })
      .then(() => {
        navigate("/dashboard")
      })
      .catch((e) => {
        if (e.response.status === 401) {
          navigate("/")
        }
      })
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#F9FcfE] [background-image:radial-gradient(#2E5674_1px,transparent_1px)] [background-size:48px_48px]">
      <LandingNavbar />
      <Hero />
      <Features />
      <Working />
      <Security />
      <Footer />
    </div>
  );
}

export default Landing;
