import { Link } from "react-router-dom";

function LandingNavbar() {
  return (
    <div className="bg-[#F5F6FB] w-full h-[4.5rem] flex items-center pl-17">
      <Link to="/">
        <img src="../../logo.png" alt="logo" className="w-[10rem]" />
      </Link>
    </div>
  );
}

export default LandingNavbar;
