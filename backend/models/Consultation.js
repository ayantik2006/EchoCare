import mongoose from "mongoose";

const schema = new mongoose.Schema({
  email: { type: String, default: "" },
  transcription: { type: String, default: "" },
  soap: { type: String, default: "" },
  duration: { type: String, default: 0 },
  date: { type: String, default: "" },
});

export default mongoose.model("Consultation", schema);
