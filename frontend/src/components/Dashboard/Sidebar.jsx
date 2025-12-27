import { LayoutGrid, Clock, Calendar, FileText, Settings, Rocket, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function Sidebar({ docName, activeTab, setActiveTab }) {
    const navigate = useNavigate();
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

    const handleLogout = async () => {
        try {
            await axios.post(BACKEND_URL + "/auth/signout", {}, { withCredentials: true });
            navigate("/");
            toast.success("Logged out successfully");
        } catch (error) {
            console.error("Logout failed:", error);
            toast.error("Logout failed");
        }
    };

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
        { id: 'sessions', label: 'Sessions', icon: Clock },
        { id: 'calendar', label: 'Calendar', icon: Calendar },
    ];

    return (
        <div className="w-[18rem] bg-[#192E46] h-screen sticky top-0 flex flex-col p-6 border-r border-[#192E46] hidden lg:flex">
            {/* Logo */}
            <div className="flex items-center justify-center gap-2 mb-10">
                <img src="../../logo.png" alt="EchoCare Logo" className="w-[10rem] h-auto object-contain brightness-0 invert" />
            </div>

            {/* Navigation */}
            <nav className="flex flex-col gap-2 flex-grow">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-medium transition-all duration-300 w-full text-left cursor-pointer ${isActive
                                ? 'bg-[#DBC6AE] text-[#192E46] shadow-md'
                                : 'text-gray-300 hover:bg-white/10'
                                }`}
                            style={isActive ? { backgroundColor: '#DBC6AE' } : {}}
                        >
                            <Icon size={20} />
                            <span>{item.label}</span>
                        </button>
                    );
                })}
            </nav>


            {/* User Profile */}
            <div className="mt-auto pt-6 border-t border-white/10">
                <div className="flex items-center gap-3 p-3 bg-[#233B55] rounded-2xl border border-white/5">
                    <div className="w-10 h-10 rounded-full bg-[#DBC6AE] flex items-center justify-center overflow-hidden text-[#192E46] font-bold text-xl">
                        {docName ? docName.charAt(0).toUpperCase() : "?"}
                    </div>
                    <div className="flex flex-col overflow-hidden text-white">
                        <span className="font-semibold text-sm truncate w-[8rem]" title={`Dr. ${docName}`}>Dr. {docName || "Loading..."}</span>
                        <span className="text-xs text-blue-200">Emergency Medicine</span>
                    </div>
                    <button onClick={handleLogout} className="ml-auto p-1 hover:bg-white/10 rounded-full text-white" title="Logout">
                        <LogOut size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Sidebar;
