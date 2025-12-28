import mongoose from "mongoose";

const schema = new mongoose.Schema({
  email: { type: String, default: "" },
  name: { type: String, default: "" },
  sharedWithMe: { type: Array, default: [] },
  sharedWithOther: { type: Array, default: [] },
});

export default mongoose.model("Account", schema);
