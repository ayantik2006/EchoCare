import mongoose from "mongoose";

const schema = new mongoose.Schema({
  email: { type: String, default: "" },
  transcription: { type: String, default: "" },
  AITranscription: { type: String, default: "" },
  soap: { type: String, default: "" },
  duration: { type: String, default: 0 },
  date: { type: String, default: "" },
  title: { type: String, default: "" },
  sharedwith: { type: Array, default: [] },
});

export default mongoose.model("Consultation", schema);
