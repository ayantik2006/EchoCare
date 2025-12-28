import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Mic,
  X,
  ArrowDownToLine,
  Save,
  SquarePen,
  Sparkles,
  Search,
  Users,
  Bell,
  Pencil,
  Trash2,
  Menu,
  Calendar,
  LogOut,
  LayoutGrid,
  Clock,
  FileText,
} from "lucide-react";
import html2pdf from "html2pdf.js";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Sidebar from "./Sidebar";
import DashboardCalendar from "./DashboardCalendar";

function Dashboard() {
  const navigate = useNavigate();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const [docName, setDocName] = useState("");
  const [consultations, setConsultations] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [transcriptValue, setTranscriptValue] = useState("");
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef("");
  const [micStartTime, setMicStartTime] = useState(0);
  const [isTranscriptVisible, setIsTranscriptVisible] = useState(false);
  const [isSoapVisible, setIsSoapVisible] = useState(false);
  const [transcriptShowValue, setTranscriptShowValue] = useState("");
  const [soapShowValue, setSoapShowValue] = useState("");
  const [consultationId, setConsultationId] = useState("");
  const [isSoapEditable, setIsSoapEditable] = useState(false);
  const [isSoapSaving, setIsSoapSaving] = useState(false);
  const [AITranscriptShowValue, setAITranscriptShowValue] = useState("");
  const [isAIEnhancing, setIsAIEnhancing] = useState(false);
  const [isAITranscriptVisible, setIsAITranscriptVisible] = useState(false);
  const [isEditTitleDialogOpen, setIsEditTitleDialogOpen] = useState(false);
  const [titleEditId, setTitleEditId] = useState("");
  const [isTitleSaving, setIsTitleSaving] = useState(false);
  const [defaultTitleValue, setDefaultTitleValue] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard"); // 'dashboard', 'sessions', 'calendar' // New State
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [confirmationDeleteId, setConfirmationDeleteId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const soapContentRef = useRef(null);

  useEffect(() => {
    axios
      .post(BACKEND_URL + "/auth/check-login", {}, { withCredentials: true })
      .then((res) => {
        setDocName(res.data.docName);
      })
      .catch((e) => {
        if (e.response?.status === 401) {
          navigate("/");
        }
      });

    axios
      .post(
        BACKEND_URL + "/dashboard/get-consultations",
        {},
        { withCredentials: true }
      )
      .then((res) => {
        setConsultations(res.data.consultations);
      })
      .catch((e) => {
        console.log(e);
      });
  }, [BACKEND_URL, navigate]);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscriptRef.current += text + " ";
        } else {
          interimTranscript += text;
        }
      }
      setTranscriptValue(finalTranscriptRef.current + interimTranscript);
    };

    recognitionRef.current = recognition;
  }, []);

  const handleCancelConsultation = (e) => {
    e.stopPropagation();
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      setTranscriptValue("");
      finalTranscriptRef.current = "";
      setMicStartTime(0);
      toast("Consultation cancelled", { icon: "🚫" });
    }
  };

  const handleStartConsultationClick = async () => {
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      if (transcriptValue.trim() === "") return;
      toast.success(
        "Session is send to our AI! Please wait for a few seconds. After that please give a title to the session",
        { duration: 5000 }
      );
      try {
        const res = await axios.post(
          BACKEND_URL + "/dashboard/get-soap",
          {
            transcriptValue: transcriptValue,
            duration: new Date().getTime() - micStartTime,
          },
          { withCredentials: true }
        );
        setConsultations(res.data.consultations);
        setMicStartTime(0);
      } catch (e) {
        console.log(e);
        if (e.response.status === 401) navigate("/");
      }
    } else {
      setMicStartTime(new Date().getTime());
      finalTranscriptRef.current = "";
      setTranscriptValue("");
      recognitionRef.current.start();
    }
    setIsRecording(!isRecording);
  };

  const getCardColor = (index) => {
    // Glassy variants of the theme colors
    const colors = [
      "bg-[#DBC6AE]/20 border border-[#DBC6AE]/30 hover:bg-[#DBC6AE]/30",
      "bg-[#F0F7FF]/60 border border-[#2E5674]/20 hover:bg-[#2E5674]/10",
      "bg-white/40 border border-[#192E46]/10 hover:bg-white/60"
    ];
    return colors[index % colors.length];
  };

  const getTextColor = (index) => {
    // All text dark due to light glass/white backgrounds
    return "text-[#192E46]";
  };

  const getSubTextColor = (index) => {
    return "text-[#192E46]/60";
  };

  const handleDeleteConsultation = (id, e) => {
    e.stopPropagation();
    setConfirmationDeleteId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      setIsDeleting(true);
      const res = await axios.post(
        BACKEND_URL + "/dashboard/delete-consultation",
        { id: confirmationDeleteId },
        { withCredentials: true }
      );
      setConsultations(res.data.consultations);
      toast.success("Consultation deleted successfully");
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setConfirmationDeleteId("");
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Failed to delete consultation");
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(
        BACKEND_URL + "/auth/signout",
        {},
        { withCredentials: true }
      );
      navigate("/");
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed");
    }
  };

  return (
    <div className="flex w-full min-h-screen bg-[#F9FcfE] [background-image:radial-gradient(#2E5674_1px,transparent_1px)] [background-size:48px_48px] font-sans selection:bg-[#DBC6AE] selection:text-[#192E46]">
      <Toaster position="top-center" reverseOrder={false} />

      {/* Sidebar */}
      <Sidebar
        docName={docName}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content */}
      <div className="flex-grow p-8 px-10 h-screen flex flex-col overflow-hidden bg-[#FDFBF7]/60 backdrop-blur-2xl lg:rounded-l-[3rem] border-l border-white/50 shadow-2xl relative">
        {/* Background Blob for Main Content */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-[#2E5674]/5 to-[#DBC6AE]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none z-0"></div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6 shrink-0 relative z-20">
          <h1 className="text-[2rem] font-bold text-[#192E46] flex items-center gap-3">
            Dashboard
          </h1>
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 bg-white rounded-full text-[#192E46] shadow-sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center overflow-hidden border border-[#DBC6AE] text-[#192E46] font-bold text-xl">
              {docName ? docName.charAt(0).toUpperCase() : "?"}
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          {isMobileMenuOpen && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 lg:hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
              <button
                onClick={() => {
                  setActiveTab("dashboard");
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left ${activeTab === "dashboard"
                  ? "text-[#2E5674] font-bold bg-blue-50/50"
                  : "text-gray-600"
                  }`}
              >
                <LayoutGrid size={18} />
                Dashboard
              </button>
              <button
                onClick={() => {
                  setActiveTab("calendar");
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left ${activeTab === "calendar"
                  ? "text-[#2E5674] font-bold bg-blue-50/50"
                  : "text-gray-600"
                  }`}
              >
                <Calendar size={18} />
                Calendar
              </button>
              <div className="h-px bg-gray-100 my-1"></div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-red-600 text-left"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </div>
          )}
        </div>

        <div className="flex gap-8 lg:flex-row flex-col flex-grow overflow-hidden relative">
          {/* Left Column: Banner, Transcript, Consultations */}
          <div
            className={`flex flex-col h-full duration-700 ease-[cubic-bezier(0.25,0.8,0.25,1)] transition-all ${activeTab === "dashboard"
              ? "lg:w-[65%] opacity-100 translate-x-0"
              : activeTab === "sessions"
                ? "w-full opacity-100 translate-x-0"
                : "w-0 opacity-0 -translate-x-[100%] overflow-hidden"
              }`}
          >
            {/* Fixed Top Section */}
            <div className="shrink-0">
              {/* Start Consultation Banner - Collapses in Sessions mode */}
              {/* Start Consultation Banner - Collapses in Sessions mode */}
              <div
                className={`w-full bg-gradient-to-r from-[#2E5674] to-[#192E46] rounded-3xl flex items-center gap-4 shadow-lg shadow-[#2E5674]/20 transition-all duration-500 ease-in-out hover:scale-[1.01] hover:shadow-xl hover:shadow-[#2E5674]/30 cursor-pointer shrink-0 overflow-hidden relative z-10 ${activeTab === "sessions"
                  ? "h-0 p-0 mb-0 opacity-0"
                  : "p-6 mb-8 h-auto opacity-100"
                  }`}
                onClick={handleStartConsultationClick}
              >
                <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner shrink-0 border border-white/20">
                  {!isRecording ? (
                    <Mic size={32} className="text-white drop-shadow-md" />
                  ) : (
                    <div className="w-6 h-6 bg-[#DBC6AE] rounded-full animate-pulse shadow-[0_0_15px_rgba(219,198,174,0.6)]"></div>
                  )}
                </div>
                <div className="flex flex-col text-white whitespace-nowrap">
                  <h2 className="text-2xl [@media(max-width:413px)]:text-[1rem] font-bold tracking-tight">
                    {isRecording ? "Listening..." : "Start New Consultation"}
                  </h2>
                  <p className="text-white/70 text-sm font-medium">
                    {isRecording ? "Click to stop and generate SOAP note" : "Tap here to begin recording"}
                  </p>
                </div>
                {isRecording && (
                  <button
                    onClick={handleCancelConsultation}
                    className="ml-auto p-3 bg-red-500/20 hover:bg-red-500/40 text-red-100 rounded-2xl transition-all mr-2 backdrop-blur-sm border border-red-500/30"
                    title="Cancel Consultation"
                  >
                    <X size={24} />
                  </button>
                )}
              </div>

              {/* Transcript Live View */}
              <div
                className={`rounded-3xl duration-300 bg-white/40 backdrop-blur-md overflow-hidden shadow-sm shrink-0 border border-white/60 ${!isRecording
                  ? "h-0 p-0 mt-0 opacity-0 border-0"
                  : "h-[12rem] p-6 opacity-100 mb-8"
                  }`}
              >
                <div className="text-[#2E5674] mb-3 font-bold flex items-center gap-2">
                  <Sparkles size={16} />
                  Live Transcription
                </div>
                <div className="text-[#192E46] font-medium leading-relaxed opacity-80 h-full overflow-y-auto pr-2 custom-scrollbar">{transcriptValue}</div>
              </div>

              <h2 className="text-2xl font-bold text-[#192E46] mb-6 shrink-0 tracking-tight">
                Recent Consultations
              </h2>

              {/* Search Bar */}
              <div className="relative mb-8 shrink-0 group">
                <Search
                  className="absolute left-5 top-1/2 transform -translate-y-1/2 text-[#2E5674]/50 group-focus-within:text-[#2E5674] transition-colors"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search by title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/60 backdrop-blur-sm rounded-2xl py-4 pl-14 pr-6 border border-white/60 focus:border-[#2E5674]/30 focus:bg-white/80 outline-none shadow-sm hover:shadow-md transition-all text-[#192E46] placeholder:text-[#192E46]/30 font-medium"
                />
              </div>
            </div>

            {/* Scrollable Consultation List */}
            <div className="flex-grow overflow-y-auto pr-2 pb-10">
              <div className="flex flex-col gap-4">
                {consultations.filter((c) =>
                  (c.title || "")
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase())
                ).length === 0 && (
                    <div className="text-center text-gray-500 py-10 bg-white rounded-2xl">
                      {searchQuery
                        ? "No matching consultations found."
                        : "No recent consultations found."}
                    </div>
                  )}
                {consultations
                  .filter((c) =>
                    (c.title || "")
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase())
                  )
                  .map((consultation, index) => (
                    <div
                      key={index}
                      className={`p-6 rounded-3xl shadow-sm hover:shadow-lg transition-all duration-300 ${getCardColor(
                        index
                      )} relative group backdrop-blur-sm`}
                    >
                      <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) =>
                            handleDeleteConsultation(consultation._id, e)
                          }
                          className="p-2 rounded-full hover:bg-red-50 text-red-300 hover:text-red-500 transition-colors"
                          title="Delete Consultation"
                          disabled={isDeleting}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <h3
                          className={`font-bold text-lg ${getTextColor(
                            index
                          )} flex items-center gap-2`}
                        >
                          {consultation.title || `Session ${consultation.date}`}
                          <Pencil
                            size={14}
                            className={`cursor-pointer opacity-40 hover:opacity-100 transition-opacity text-[#2E5674]`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsEditTitleDialogOpen(true);
                              setTitleEditId(consultation._id);
                              setDefaultTitleValue(consultation.title);
                            }}
                          />
                        </h3>
                      </div>
                      <div className={`text-sm mb-5 font-medium flex items-center gap-3 ${getSubTextColor(index)}`}>
                        <div className="flex items-center gap-1 bg-white/50 px-2 py-1 rounded-lg">
                          <Calendar size={12} /> {consultation.date}
                        </div>
                        <div className="flex items-center gap-1 bg-white/50 px-2 py-1 rounded-lg">
                          <Clock size={12} /> {consultation.duration}
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button
                          className="flex-1 bg-[#192E46] text-white hover:bg-[#2E5674] px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center gap-2"
                          onClick={() => {
                            setIsSoapVisible(true);
                            setSoapShowValue(consultation.soap);
                            setConsultationId(consultation._id);
                          }}
                        >
                          <FileText size={16} /> SOAP Note
                        </button>
                        <button
                          className="flex-1 bg-white text-[#192E46] border border-[#192E46]/10 hover:bg-gray-50 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-md active:scale-95 flex items-center justify-center gap-2"
                          onClick={() => {
                            setIsTranscriptVisible(true);
                            setTranscriptShowValue(consultation.transcription);
                            setAITranscriptShowValue(
                              consultation.AITranscription
                            );
                            setConsultationId(consultation._id);
                            setIsAIEnhancing(false);
                            setIsAITranscriptVisible(false);
                          }}
                        >
                          <Users size={16} /> Transcript
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Calendar Section (Right Column) */}
          <div
            className={`flex flex-col h-full sticky top-0 duration-700 ease-[cubic-bezier(0.25,0.8,0.25,1)] transition-all ${activeTab === "dashboard"
              ? "lg:w-[35%] opacity-100 translate-x-0"
              : activeTab === "calendar"
                ? "w-full opacity-100 translate-x-0"
                : "w-0 opacity-0 translate-x-[100%] overflow-hidden"
              }`}
          >
            <DashboardCalendar
              consultations={consultations}
              isExpanded={activeTab === "calendar"}
            />
          </div>
        </div>
      </div>

      {/* Transcript Modal */}
      {isTranscriptVisible && (
        <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col p-8 shadow-2xl relative animate-in fade-in zoom-in duration-300">
            <button
              className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors"
              onClick={() => {
                setIsTranscriptVisible(false);
                setTranscriptShowValue("");
              }}
            >
              <X size={24} className="text-gray-500" />
            </button>

            <div className="flex flex-wrap gap-2 items-center justify-between mb-2 pr-12">
              <h2 className="text-2xl font-bold text-[#192E46]">Transcript</h2>
              <button
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${isAIEnhancing
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                  }`}
                onClick={async () => {
                  if (isAIEnhancing) return;
                  try {
                    setIsAIEnhancing(true);
                    toast.success("AI Enhancing has started...");
                    const res = await axios.post(
                      BACKEND_URL + "/dashboard/enhance-transcript",
                      { transcript: transcriptShowValue, id: consultationId },
                      { withCredentials: true }
                    );
                    setConsultations(res.data.consultations);
                    setAITranscriptShowValue(res.data.AITranscript);
                    setIsAIEnhancing(false);
                    toast.success("Transcript enhanced with AI!");
                  } catch (e) {
                    console.log(e);
                    setIsAIEnhancing(false);
                  }
                }}
              >
                <Sparkles size={16} />
                {AITranscriptShowValue === "" ? "AI Enhance" : "Re-Enhance"}
              </button>
            </div>

            <p className="text-gray-400 text-sm italic mb-6 border-b border-gray-100 pb-4">
              (This transcript is auto-generated from speech and may contain
              inaccuracies)
            </p>

            {AITranscriptShowValue !== "" && (
              <div className="flex items-center gap-3 mb-4 bg-blue-50 p-2 rounded-lg self-start">
                <input
                  type="checkbox"
                  id="show-ai-transcript"
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  onChange={(e) => setIsAITranscriptVisible(e.target.checked)}
                />
                <label
                  htmlFor="show-ai-transcript"
                  className="text-sm font-medium text-blue-700 cursor-pointer"
                >
                  Show AI Enhanced Version
                </label>
              </div>
            )}

            <div className="flex-grow overflow-y-auto bg-gray-50 rounded-xl p-6">
              <pre className="font-sans text-[#192E46] whitespace-pre-wrap leading-relaxed">
                {!isAITranscriptVisible
                  ? transcriptShowValue
                  : AITranscriptShowValue}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* SOAP Modal */}
      {isSoapVisible && (
        <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl h-[90vh] flex flex-col p-8 shadow-2xl relative animate-in fade-in zoom-in duration-300">
            <button
              className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors"
              onClick={() => {
                setIsSoapVisible(false);
                setSoapShowValue("");
                setConsultationId("");
                setIsSoapEditable(false);
              }}
            >
              <X size={24} className="text-gray-500" />
            </button>

            <div className="flex flex-wrap gap-2 items-center justify-between mb-6 pr-12">
              <div className="flex flex-wrap gap-3">
                <button
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-[#2E5674] text-[#2E5674] hover:bg-white/50 transition-all ${isSoapSaving ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  onClick={async () => {
                    if (!isSoapEditable) {
                      soapContentRef.current.focus();
                      setIsSoapEditable(true);
                      return;
                    }
                    if (consultationId == "") return;
                    try {
                      setIsSoapSaving(true);
                      setIsSoapEditable(false);
                      const res = await axios.post(
                        BACKEND_URL + "/dashboard/update-soap",
                        {
                          newSoap: soapContentRef.current.innerText,
                          id: consultationId,
                        },
                        { withCredentials: true }
                      );
                      setConsultations(res.data.consultations);
                      setIsSoapEditable(false);
                      setIsSoapSaving(false);
                      toast.success("SOAP successfully saved!");
                    } catch (e) {
                      console.log(e);
                      setIsSoapSaving(false);
                    }
                  }}
                >
                  {isSoapEditable ? (
                    <Save size={16} />
                  ) : (
                    <SquarePen size={16} />
                  )}
                  {isSoapEditable
                    ? "Save Edits"
                    : isSoapSaving
                      ? "Saving..."
                      : "Edit Mode"}
                </button>
                <button
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-[#2E5674] text-white hover:bg-[#192E46] transition-all"
                  onClick={() => {
                    const element =
                      document.getElementById("soap-note-content");
                    html2pdf()
                      .set({
                        margin: 12,
                        filename: `SOAP_${new Date().toLocaleDateString(
                          "en-IN"
                        )}.pdf`,
                        image: { type: "jpeg", quality: 0.98 },
                        html2canvas: { scale: 2, useCORS: true },
                        jsPDF: {
                          unit: "mm",
                          format: "a4",
                          orientation: "portrait",
                        },
                      })
                      .from(element)
                      .save();
                  }}
                >
                  <ArrowDownToLine size={16} />
                  Export PDF
                </button>
              </div>
            </div>

            <div className="flex-grow overflow-y-auto bg-white rounded-xl border border-gray-100 shadow-inner">
              <pre
                id="soap-note-content"
                className={`font-sans text-[#192E46] whitespace-pre-wrap leading-relaxed p-8 outline-none h-full ${isSoapEditable ? "bg-blue-50/50" : ""
                  }`}
                contentEditable={isSoapEditable}
                suppressContentEditableWarning
                ref={soapContentRef}
              >
                <div>
                  <h2 className="text-2xl font-bold text-[#192E46]">
                    SOAP Note
                  </h2>
                  <p className="text-[#A0A8B5] text-sm italic mt-1 mb-5">
                    (Generated by EchoCare AI · Requires clinician review)
                  </p>
                </div>
                {soapShowValue}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Edit Title Dialog */}
      <Dialog
        open={isEditTitleDialogOpen}
        onClose={() => setIsEditTitleDialogOpen(false)}
        PaperProps={{
          style: { borderRadius: "1rem", padding: "1rem" },
        }}
      >
        <DialogTitle className="font-bold text-[#192E46]">
          Edit Consultation Title
        </DialogTitle>
        <DialogContent>
          <DialogContentText className="mb-4">
            Give this session a descriptive title for easy reference.
          </DialogContentText>
          <form
            id="edit-title-form"
            className="flex flex-col gap-3 mt-2"
            onSubmit={async (e) => {
              e.preventDefault();
              setIsTitleSaving(true);
              try {
                const res = await axios.post(
                  BACKEND_URL + "/dashboard/edit-title",
                  { id: titleEditId, title: e.currentTarget[0].value },
                  { withCredentials: true }
                );
                toast.success("Title saved!", { duration: 3000 });
                setIsTitleSaving(false);
                setConsultations(res.data.consultations);
                setIsEditTitleDialogOpen(false);
              } catch (e) {
                console.log(e);
                setIsTitleSaving(false);
              }
            }}
          >
            <input
              type="text"
              className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-4 focus:outline-none focus:border-[#2E5674] transition-colors"
              required
              defaultValue={defaultTitleValue}
              placeholder="e.g., General Checkup - John Doe"
            />
          </form>
        </DialogContent>
        <DialogActions className="px-6 pb-4">
          <button
            onClick={() => setIsEditTitleDialogOpen(false)}
            className="px-4 py-2 text-gray-500 font-medium hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="edit-title-form"
            className={`px-4 py-2 bg-[#2E5674] text-white font-medium rounded-lg hover:opacity-90 transition-opacity ${isTitleSaving ? "opacity-70 pointer-events-none" : ""
              }`}
          >
            {isTitleSaving ? "Saving..." : "Save Changes"}
          </button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        PaperProps={{
          style: { borderRadius: "1rem", padding: "1rem" },
        }}
      >
        <DialogTitle className="font-bold text-[#192E46]">
          Delete Consultation?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this consultation? This action
            cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions className="px-6 pb-4">
          <button
            onClick={() => setIsDeleteDialogOpen(false)}
            className="px-4 py-2 text-gray-500 font-medium hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={confirmDelete}
            className={`px-4 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors ${isDeleting ? "opacity-70 pointer-events-none" : ""
              }`}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default Dashboard;
