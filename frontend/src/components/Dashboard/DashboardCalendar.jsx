import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

function DashboardCalendar({ consultations = [], isExpanded = false }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0 });

    const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const totalDays = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);

    const days = [];
    for (let i = 0; i < startDay; i++) {
        days.push(null);
    }
    for (let i = 1; i <= totalDays; i++) {
        days.push(i);
    }

    // Process consultations to map dates to counts
    // Assuming consultation.date is in "DD/MM/YYYY" format based on other parts of the app
    const getConsultationsForDate = (day) => {
        if (!day) return 0;
        const targetDateStr = `${String(day).padStart(2, '0')}/${String(month + 1).padStart(2, '0')}/${year}`;
        return consultations.filter(c => c.date === targetDateStr).length;
    };

    const getAppointmentColor = (count) => {
        if (count === 0) return "";
        if (count > 2) return "bg-[#2E5674]"; // Medium Blue for high activity
        return "bg-[#DBC6AE]"; // Beige for moderate activity
    };

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const handlePrevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const handleContextMenu = (e) => {
        e.preventDefault();
        e.stopPropagation(); // Stop event from bubbling to document listeners
        setContextMenu({
            visible: true,
            x: e.clientX + 10, // Offset to appear to the right of cursor
            y: e.clientY
        });
    };

    const handleResetDate = () => {
        setCurrentDate(new Date());
        setContextMenu({ ...contextMenu, visible: false });
    };

    // Close menu on click elsewhere
    useEffect(() => {
        const handleClick = () => setContextMenu({ ...contextMenu, visible: false });
        if (contextMenu.visible) {
            document.addEventListener("click", handleClick);
            document.addEventListener("contextmenu", handleClick); // Also close on right click elsewhere
        }
        return () => {
            document.removeEventListener("click", handleClick);
            document.removeEventListener("contextmenu", handleClick);
        };
    }, [contextMenu]);

    return (
        <div
            onContextMenu={handleContextMenu}
            className={`bg-white rounded-2xl shadow-sm flex flex-col transition-all duration-700 ${isExpanded ? 'h-full p-6' : 'h-fit p-4'}`}
        >
            {/* Header */}
            <div className={`flex items-center justify-between shrink-0 ${isExpanded ? 'mb-4' : 'mb-3'}`}>
                <div className="flex items-center gap-2">
                    <h2 className={`font-bold text-[#192E46] ${isExpanded ? 'text-2xl' : 'text-base'}`}>{monthNames[month]} {year}</h2>
                    <div className="flex gap-1 ml-2">
                        <button onClick={handlePrevMonth} className="p-0.5 hover:bg-gray-100 rounded-full">
                            <ChevronLeft size={isExpanded ? 20 : 14} className="text-gray-400" />
                        </button>
                        <button onClick={handleNextMonth} className="p-0.5 hover:bg-gray-100 rounded-full">
                            <ChevronRight size={isExpanded ? 20 : 14} className="text-[#2E5674]" />
                        </button>
                    </div>
                </div>
                <span className={`font-semibold text-[#192E46] ${isExpanded ? 'text-base' : 'text-xs'}`}>
                    {consultations.length} Appts Done
                </span>
            </div>

            {/* Day Names Header */}
            <div className={`grid grid-cols-7 text-center shrink-0 mb-2 ${isExpanded ? 'text-base' : 'text-xs'}`}>
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className={`font-medium py-1 ${day === "Sun" ? "bg-[#F0EBE0] rounded-t-lg" : ""}`}>{day}</div>
                ))}
            </div>

            {/* Dates Grid - Using grid-rows-6 to force fit vertical space */}
            <div className={`grid grid-cols-7 flex-grow ${isExpanded ? 'grid-rows-6 gap-2 text-base' : 'gap-y-1 text-xs'}`}>
                {days.map((day, index) => {
                    const count = getConsultationsForDate(day);
                    const colorClass = getAppointmentColor(count);

                    return (
                        <div key={index} className={`flex items-center justify-center relative p-0.5 ${(index % 7 === 0 || index % 7 === 6) && day ? "" : ""} group w-full h-full`}>
                            {day && (
                                <>
                                    {/* Sunday/Saturday Background Wrapper */}
                                    {index % 7 === 0 && <div className="absolute inset-0 bg-[#F0EBE0] -z-10 rounded-lg"></div>}

                                    <div className={`w-full h-full flex items-center justify-center rounded-md relative ${colorClass} ${colorClass ? "text-white font-medium cursor-pointer" : "text-gray-600"}`}>
                                        {day}
                                        {/* Hover Tooltip - Only visible if expanded and has consultations */}
                                        {isExpanded && count > 0 && (
                                            <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none shadow-lg">
                                                {count} Consultations
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                            {/* Empty Sunday slots background */}
                            {!day && index % 7 === 0 && <div className="absolute inset-0 bg-[#F5F0E6] -z-10 rounded-lg"></div>}
                        </div>
                    );
                })}
            </div>

            {/* Custom Context Menu - Rendered via Portal to escape parent transforms */}
            {contextMenu.visible && createPortal(
                <div
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                    className="fixed bg-white shadow-xl rounded-lg p-1 z-[9999] border border-gray-100 animate-in fade-in zoom-in-95 duration-100 min-w-[150px]"
                    onClick={(e) => e.stopPropagation()}
                    onContextMenu={(e) => e.preventDefault()}
                >
                    <button
                        onClick={handleResetDate}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-[#192E46] hover:bg-gray-50 rounded-md w-full transition-colors font-medium"
                    >
                        <RotateCcw size={14} className="text-[#2E5674]" />
                        Reset to Today
                    </button>
                </div>,
                document.body
            )}
        </div>
    );
}

export default DashboardCalendar;
