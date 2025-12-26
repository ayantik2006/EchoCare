import MainNavbar from "../MainNavbar";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Mic, X, ArrowDownToLine, Save } from "lucide-react";
import html2pdf from "html2pdf.js";

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
      <MainNavbar />
      <div className="mx-30">
        <h1 className="mt-10 text-[2rem] font-semibold text-[#2E384A]">
          Welcome back Dr. {docName}
        </h1>
        <div className="flex items-center flex-wrap gap-2 mt-10">
          <button
            className="flex gap-2 items-center bg-[#3C73D0] text-white px-5 py-2 text-[1.1rem] rounded-md cursor-pointer hover:opacity-90"
            onClick={handleStartConsultationClick}
          >
            {!isRecording && <Mic className="" />}
            {!isRecording && <p>Start New Consultation</p>}
            {isRecording && (
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-red-300 rounded-full animate-pulse"></div>
                <p>Stop Recording and get SOAP</p>
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
          <div className="text-neutral-500">Transcription</div>
          {transcriptValue}
        </div>

        <h2 className="mt-10 text-[1.5rem] text-[#2E384A] font-semibold">
          Recent Consultations
        </h2>
        {consultations.length == 0 && (
          <div className="mt-5 text-neutral-500">No recent consultations</div>
        )}
        {consultations.length !== 0 && (
          <div className="flex flex-wrap items-center mt-5">
            {consultations.map((consultation, index) => {
              return (
                <div
                  className="w-fit h-fit p-5 flex flex-col gap-3 items-start shadow-[0_0_4px_gray] duration-300 hover:-translate-y-1 hover:translate-x-1 hover:shadow-[0_0_10px_gray]"
                  key={index}
                >
                  <h2 className="font-semibold">Date: {consultation.date}</h2>
                  <h3 className="flex">
                    <p className="text-neutral-400">Duration:&nbsp;</p>{" "}
                    {consultation.duration}
                  </h3>
                  <button
                    className="bg-[#3C73D0] text-white px-3 py-[0.1rem]  rounded-md text-[0.9rem] cursor-pointer hover:opacity-90"
                    onClick={() => {
                      setIsSoapVisible(true);
                      setSoapShowValue(consultation.soap);
                    }}
                  >
                    Get SOAP
                  </button>
                  <button
                    className="border-2 border-[#3C73D0] text-[#3C73D0] px-3 py-[0.1rem] rounded-md text-[0.9rem] cursor-pointer hover:opacity-90"
                    onClick={() => {
                      setIsTranscriptVisible(true);
                      setTranscriptShowValue(consultation.transcription);
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
        <div className="w-full h-full z-80 absolute bg-white flex flex-col items-center p-10 gap-3">
          <div
            className="ml-auto cursor-pointer"
            onClick={() => {
              setIsTranscriptVisible(false);
              setTranscriptShowValue("");
            }}
          >
            <X />
          </div>
          <h1 className="text-[#2E384A] text-[1.8rem] font-semibold">
            Transcript
          </h1>
          <p className="text-[1.1rem]">{transcriptShowValue}</p>
        </div>
      )}

      {isSoapVisible && (
        <div className="max-w-full overflow-y-auto overflow-x-hidden h-full z-80 absolute bg-white flex flex-col items-center p-10 gap-3">
          <div
            className="ml-auto cursor-pointer"
            onClick={() => {
              setIsSoapVisible(false);
              setSoapShowValue("");
            }}
          >
            <X />
          </div>
          <div className="flex items-center gap-3">
            <button className="px-3 py-[0.1rem] border-2 border-[#3C73D0] rounded-md flex items-center gap-1 text-[#3C73D0] cursor-pointer">
              <Save size={16} />
              Save Edits
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
              SOAP Note (Generated by AI)
            </h1>
            <pre
              className="text-[1.1rem] font-sans p-10 whitespace-pre-wrap outline-none"
              suppressContentEditableWarning
              contentEditable
            >
              {soapShowValue}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
