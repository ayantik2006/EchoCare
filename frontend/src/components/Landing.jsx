import LandingNavbar from "./LandingNavbar";
import Hero from "./Hero";
import Features from "./Features";
import Working from "./Working";
import Footer from "./Footer";

function Landing() {
  return (
    <div>
      <LandingNavbar />
      <Hero/>
      <Features/>
      <Working/>
      <Footer/>
    </div>
  );
}

export default Landing;
