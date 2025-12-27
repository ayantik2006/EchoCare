import { Link } from "react-router-dom";

function LandingNavbar() {
  return (
    <div className="bg-[#F0EBE0]/80 backdrop-blur-md sticky top-0 z-50 border-b border-[#192E46]/10 w-full h-[5rem] flex items-center pl-17">
      <Link to="/">
        <img src="../../logo.png" alt="logo" className="w-[10rem]" />
      </Link>
    </div>
  );
}

export default LandingNavbar;
