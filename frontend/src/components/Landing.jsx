import LandingNavbar from "./LandingNavbar";
import Hero from "./Hero";
import Features from "./Features";
import Working from "./Working";
import Footer from "./Footer";
import { useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function Landing() {
  const navigate=useNavigate();

  useEffect(()=>{
    axios.post(BACKEND_URL+"/auth/check-login",{},{withCredentials:true})
    .then(()=>{
      navigate("/dashboard")
    })
    .catch((e)=>{
      if(e.response.status===401){
        navigate("/")
      }
    })
  },[navigate]);

  return (
    <div className="bg-[#F0EBE0] min-h-screen">
      <LandingNavbar />
      <Hero/>
      <Features/>
      <Working/>
      <Footer/>
    </div>
  );
}

export default Landing;
