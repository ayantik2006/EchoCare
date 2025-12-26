import MainNavbar from "../MainNavbar";
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
  Pencil,
} from "lucide-react";
import html2pdf from "html2pdf.js";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

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
  const [titleEditId,setTitleEditId]=useState("");
  const [isTitleSaving,setIsTitleSaving]=useState(false);
  const [defaultTitleValue,setDefaultTitleValue]=useState("");
  const soapContentRef = useRef(null);

  useEffect(() => {
    axios
      .post(BACKEND_URL + "/auth/check-login", {}, { withCredentials: true })
      .then((res) => {
        setDocName(res.data.docName);
        navigate("/dashboard");
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

  return (
    <div className="flex w-full flex-col items-start">
      <Toaster position="top-center" reverseOrder={false} />
      <MainNavbar />
      <div className="ml-20 mr-20 [@media(max-width:418px)]:mx-10">
        <div className="mt-10 text-[2rem] font-semibold text-[#2E384A] flex items-center gap-2 flex-wrap [@media(max-width:418px)]:text-[1.5rem]">
          <div>Welcome back</div> <div>Dr. {docName}</div>
        </div>
        <div className="flex items-center flex-wrap gap-2 mt-10">
          <button
            className="flex gap-2 items-center bg-[#3C73D0] text-white px-5 py-2 text-[1.1rem] rounded-md cursor-pointer hover:opacity-90 [@media(max-width:418px)]:text-[1rem] [@media(max-width:418px)]:px-3"
            onClick={handleStartConsultationClick}
          >
            {!isRecording && <Mic className="" />}
            {!isRecording && <p>Start New Consultation</p>}
            {isRecording && (
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-red-300 rounded-full animate-pulse"></div>
                <p>Stop and get SOAP</p>
              </div>
            )}
          </button>
          {isRecording && (
            <button
              className="py-[0.58rem] bg-[#3C73D0] text-white px-3 rounded-md cursor-pointer hover:opacity-90"
              onClick={() => {
                recognitionRef.current.stop();
                setIsRecording(false);
              }}
            >
              Cancel
            </button>
          )}
        </div>

        <div
          className={`rounded-md duration-200 bg-[#F5F6FB] overflow-y-auto ${
            !isRecording
              ? "h-0 p-0 mt-0 border-0 w-0"
              : "h-[10rem] p-3 py-2 mt-5 w-full  border-2 border-[#3C73D0]"
          }`}
          defaultValue={transcriptValue}
        >
          <div className="text-neutral-500">Raw Transcription</div>
          {transcriptValue}
        </div>

        <h2 className="mt-10 text-[1.5rem] text-[#2E384A] font-semibold [@media(max-width:418px)]:text-[1.1rem]">
          Recent Consultations
        </h2>
        {consultations.length == 0 && (
          <div className="mt-5 text-neutral-500">No recent consultations</div>
        )}
        {consultations.length !== 0 && (
          <div className="flex gap-8 flex-wrap items-center mt-5 pb-10">
            {consultations.map((consultation, index) => {
              return (
                <div
                  className="w-fit h-fit p-5 flex flex-col gap-3 items-start shadow-[0_0_4px_gray] duration-300 hover:-translate-y-1 hover:translate-x-1 hover:shadow-[0_0_10px_gray] rounded-lg"
                  key={index}
                >
                  <div className="flex items-center justify-between gap-4 w-full">
                    <h2 className="font-semibold">
                      {consultation.title === ""
                        ? "Title_" + consultation.date
                        : consultation.title}
                    </h2>
                    <Pencil
                      className="stroke-neutral-500 cursor-pointer hover:stroke-neutral-700"
                      size={14}
                      onClick={() => {
                        setIsEditTitleDialogOpen(true);
                        setTitleEditId(consultation._id);
                        setDefaultTitleValue(consultation.title);
                      }}
                    />
                  </div>
                  <h2 className="text-neutral-400 mb-[-0.5rem]">
                    Date: {consultation.date}
                  </h2>
                  <h3 className="flex text-neutral-400">
                    <p className="text-neutral-400">Duration:&nbsp;</p>{" "}
                    {consultation.duration}
                  </h3>
                  <button
                    className="bg-[#3C73D0] text-white px-3 py-[0.1rem]  rounded-md text-[0.9rem] cursor-pointer hover:opacity-90"
                    onClick={() => {
                      setIsSoapVisible(true);
                      setSoapShowValue(consultation.soap);
                      setConsultationId(consultation._id);
                    }}
                  >
                    Get SOAP
                  </button>
                  <button
                    className="border-2 border-[#3C73D0] text-[#3C73D0] px-3 py-[0.1rem] rounded-md text-[0.9rem] cursor-pointer hover:opacity-90"
                    onClick={() => {
                      setIsTranscriptVisible(true);
                      setTranscriptShowValue(consultation.transcription);
                      setAITranscriptShowValue(consultation.AITranscription);
                      setConsultationId(consultation._id);
                      setIsAIEnhancing(false);
                      setIsAITranscriptVisible(false);
                    }}
                  >
                    Transcript
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {isTranscriptVisible && (
        <div className="w-full min-h-full z-80 absolute bg-white flex flex-col items-center p-10 gap-3">
          <div
            className="ml-auto cursor-pointer"
            onClick={() => {
              setIsTranscriptVisible(false);
              setTranscriptShowValue("");
            }}
          >
            <X />
          </div>
          <h1 className="text-[#2E384A] text-[1.8rem] font-semibold flex items-center w-full justify-between gap-3">
            <div className="">Transcript</div>
            <div
              className={`text-[1rem] mt-2 flex gap-1 items-center bg-blue-100 px-2 py-1 rounded-lg cursor-pointer duration-300 hover:bg-blue-200 ${
                isAIEnhancing ? "pointer-events-none bg-gray-300" : ""
              }`}
              onClick={async () => {
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
                }
              }}
            >
              <Sparkles size={16} />
              {AITranscriptShowValue === "" ? "AI Enhance" : "Re-Enhance"}
            </div>
          </h1>
          <p className="items-start w-full text-neutral-500 italic">
            (This transcript is auto-generated from speech and may contain
            inaccuracies)
          </p>
          {AITranscriptShowValue !== "" && (
            <div className="self-start flex items-center gap-2 bg-blue-200 px-2 py-1 rounded-lg font-semibold">
              <input
                type="checkbox"
                className="w-[1rem] h-[1rem] cursor-pointer"
                id="show-ai-transcript"
                onChange={(e) => {
                  setIsAITranscriptVisible(e.currentTarget.checked);
                }}
              />
              <label htmlFor="show-ai-transcript" className="cursor-pointer">
                Show AI Version
              </label>
            </div>
          )}
          <pre className="text-[1.1rem] font-sans whitespace-pre-wrap mt-5 pb-10">
            {!isAITranscriptVisible
              ? transcriptShowValue
              : AITranscriptShowValue}
          </pre>
        </div>
      )}

      {isSoapVisible && (
        <div className="w-full overflow-y-auto overflow-x-hidden h-full z-80 absolute bg-white flex flex-col items-center p-10 gap-3">
          <div
            className="ml-auto cursor-pointer"
            onClick={() => {
              setIsSoapVisible(false);
              setSoapShowValue("");
              setConsultationId("");
              setIsSoapEditable(false);
            }}
          >
            <X />
          </div>
          <div className="flex items-center gap-3">
            <button
              className={`px-3 py-[0.1rem] border-2 border-[#3C73D0] rounded-md flex items-center gap-1 text-[#3C73D0] cursor-pointer ${
                isSoapSaving ? "pointer-events-none" : ""
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
                }
              }}
            >
              {isSoapEditable && (
                <p className="flex items-center gap-1">
                  <Save size={16} />
                  Save Edits
                </p>
              )}
              {!isSoapEditable && (
                <p className={"flex items-center gap-1"}>
                  <SquarePen size={16} />
                  {!isSoapSaving ? "Edit Soap" : "Saving..."}
                </p>
              )}
            </button>
            <button
              className="bg-[#3C73D0] px-3 text-white py-1 flex gap-1 items-center rounded-md hover:opacity-90 cursor-pointer
            "
              onClick={() => {
                const element = document.getElementById("soap-note");
                html2pdf()
                  .set({
                    margin: 12,
                    filename: `SOAP_${new Date().toLocaleDateString(
                      "en-IN"
                    )}.pdf`,
                    image: { type: "jpeg", quality: 0.98 },
                    html2canvas: {
                      scale: 2,
                      useCORS: true,
                    },
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
              Export
            </button>
          </div>
          <div id="soap-note" className="flex flex-col items-center mt-4">
            <h1 className="text-[#2E384A] text-[1.8rem] font-semibold">
              SOAP Note
            </h1>
            <h1 className="text-[#6b6b6b] text-[0.9rem] italic text-center">
              (Generated by EchoCare AI · Requires clinician review)
            </h1>
            <pre
              className={`text-[1.1rem] font-sans p-10 px-2 whitespace-pre-wrap outline-none ${
                isSoapEditable
                  ? "bg-blue-100 rounded-md border border-blue-500 mt-5"
                  : ""
              }`}
              suppressContentEditableWarning
              contentEditable={isSoapEditable}
              ref={soapContentRef}
            >
              {soapShowValue}
            </pre>
          </div>
        </div>
      )}

      <Dialog
        open={isEditTitleDialogOpen}
        onClose={() => {
          setIsEditTitleDialogOpen(false);
        }}
      >
        <DialogTitle>Edit Consultation Title</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Create or Edit the consultation title. This will help to find and track them easily.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <form className="flex flex-col gap-3 w-full px-4 pb-2 mt-[-1rem]" onSubmit={async (e)=>{
            e.preventDefault();
            setIsTitleSaving(true);
            try{
              const res=await axios.post(BACKEND_URL+"/dashboard/edit-title",{id:titleEditId, title:e.currentTarget[0].value},{withCredentials:true});
              toast.success("Title saved!",{duration:3000});
              setIsTitleSaving(false);
              setConsultations(res.data.consultations);
              setIsEditTitleDialogOpen(false);
            }catch(e){
              console.log(e);
            }
          }}>
            <input type="text" className="border outline-none px-2 py-1" required defaultValue={defaultTitleValue} placeholder="Consultation Title" />
            <button type="submit" className={`bg-[#3C73D0] text-white py-1 rounded-md hover:opacity-90 cursor-pointer ${isTitleSaving?"bg-neutral-400 pointer-events-none":""}`} >{isTitleSaving?"Saving...":"Save Title"}</button>
          </form>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default Dashboard;
