import { Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function MainNavbar() {
  const navigate=useNavigate();

  const handleSignout = async () => {
    try {
      await axios.post(
        BACKEND_URL + "/auth/signout",
        {},
        { withCredentials: true }
      );
      navigate("/");
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className="bg-[#F5F6FB] w-full h-[4.5rem] flex items-center pl-10 justify-between">
      <Link to="/dashboard">
        <img src="../../logo.png" alt="logo" className="w-[10rem]" />
      </Link>
      <button
        className="mr-10 text-[#5d8ace] hover:underline cursor-pointer"
        onClick={handleSignout}
      >
        Sign out
      </button>
    </div>
  );
}

export default MainNavbar;
