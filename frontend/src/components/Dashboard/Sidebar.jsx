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
        <div className="w-[20rem] h-screen sticky top-0 flex flex-col p-6 hidden lg:flex relative z-50">
            {/* Glass Background */}
            <div className="absolute inset-0 bg-[#192E46]/95 backdrop-blur-xl border-r border-white/5 shadow-2xl z-0"></div>

            {/* Content Container */}
            <div className="relative z-10 flex flex-col h-full">
                {/* Logo */}
                <div className="flex items-center justify-center gap-2 mb-12">
                    <img src="../../logo.png" alt="EchoCare Logo" className="w-[10rem] h-auto object-contain brightness-0 invert drop-shadow-md" />
                </div>

                {/* Navigation */}
                <nav className="flex flex-col gap-3 flex-grow">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-medium transition-all duration-300 w-full text-left cursor-pointer group relative overflow-hidden ${isActive
                                    ? 'text-[#192E46] shadow-lg shadow-[#DBC6AE]/20'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {isActive && (
                                    <div className="absolute inset-0 bg-[#DBC6AE] z-0"></div>
                                )}
                                <Icon size={22} className="relative z-10" />
                                <span className="relative z-10 tracking-wide text-[0.95rem]">{item.label}</span>
                            </button>
                        );
                    })}
                </nav>


                {/* User Profile */}
                <div className="mt-auto pt-6 border-t border-white/10">
                    <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors cursor-pointer group">
                        <div className="w-12 h-12 rounded-xl bg-[#DBC6AE] flex items-center justify-center overflow-hidden text-[#192E46] font-bold text-xl shadow-inner shrink-0">
                            {docName ? docName.charAt(0).toUpperCase() : "?"}
                        </div>
                        <div className="flex flex-col overflow-hidden text-white">
                            <span className="font-semibold text-sm truncate w-[9rem] tracking-wide" title={`Dr. ${docName}`}>Dr. {docName || "Loading..."}</span>
                            <span className="text-xs text-gray-400 font-medium">View Profile</span>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); handleLogout(); }} className="ml-auto p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors" title="Logout">
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Sidebar;
