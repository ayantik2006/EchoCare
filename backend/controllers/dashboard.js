import Consultation from "../models/Consultation.js";
import Account from "../models/Account.js";
import jwt from "jsonwebtoken";
import axios from "axios";
import humanizeDuration from "humanize-duration";

export const getConsultations = async (req, res) => {
  const email = jwt.verify(req.cookies.user, process.env.JWT_SECRET).user;
  const consultationData = await Consultation.find({ email: email });

  // Lazy Migration: Sync sharedwith field with actual shared accounts
  for (let i = 0; i < consultationData.length; i++) {
    const consultation = consultationData[i];
    
    // Find all accounts that have this consultation in their sharedWithMe list
    // Note: This relies on the Account model being the source of truth for access
    const sharedAccounts = await Account.find({ sharedWithMe: consultation._id.toString() });
    
    // Extract emails
    const correctSharedWith = sharedAccounts.map(acc => acc.email);
    
    // Check if update is needed (simple stringify comparison for arrays)
    const currentSharedWith = Array.isArray(consultation.sharedwith) ? consultation.sharedwith : [];
    
    // Sort to ensure order doesn't affect comparison
    const sortedCurrent = [...currentSharedWith].sort();
    const sortedCorrect = [...correctSharedWith].sort();
    
    if (JSON.stringify(sortedCurrent) !== JSON.stringify(sortedCorrect)) {
       console.log(`Migrating sharedwith for consultation ${consultation._id}`);
       await Consultation.updateOne({ _id: consultation._id }, { sharedwith: correctSharedWith });
       // Update the local object so the response is correct immediately
       consultation.sharedwith = correctSharedWith;
    }
  }

  return res
    .status(200)
    .json({ consultations: [...consultationData].reverse() });
};

export const getSharedConsultations = async (req, res) => {
  const email = jwt.verify(req.cookies.user, process.env.JWT_SECRET).user;
  const userAccount = await Account.findOne({ email: email });
  if (!userAccount) {
    return res.status(404).json({ msg: "User account not found" });
  }

  const sharedConsultationIds = userAccount.sharedWithMe;
  const sharedConsultations = await Consultation.find({
    _id: { $in: sharedConsultationIds },
  });

  return res
    .status(200)
    .json({ consultations: [...sharedConsultations].reverse() });
};

export const getSoap = async (req, res) => {
  try {
    if (!req.cookies.user) {
      return res.status(401).json({ msg: "unauthorized" });
    }
    const email = jwt.verify(req.cookies.user, process.env.JWT_SECRET).user;

    const transcriptValue = req.body.transcriptValue;
    let duration = Number(req.body.duration);
    const humanizedDuration = humanizeDuration(duration, {
      units: ["h", "m", "s"],
      round: true,
      spacer: "",
      delimiter: " ",
    });

    if (!transcriptValue || transcriptValue.trim().length === 0) {
      return res.status(400).json({ msg: "Transcript is empty" });
    }

    const prompt = `
You are a medical documentation assistant.

The following transcript is from a doctor-patient consultation.
Conversation:
"""
${transcriptValue}
"""

Assume:
- Questions, diagnoses, advice, and prescriptions are spoken by the DOCTOR.
- Symptoms, complaints, and personal history are spoken by the PATIENT.

Rules:
- Do NOT invent information.
- Use clinical language.
- If something is unclear, write "Not mentioned".
- Be concise and structured.
- Ignore irrelevant conversation.
- The output should be properly formatted(whitespaces and line gaps)

Format strictly as:

Subjective:
- ...

Objective:
- ...

Assessment:
- ...

Plan:
- ...
`;

    const response = await axios.post(
      "https://api.perplexity.ai/chat/completions",
      {
        model: "sonar",
        messages: [
          {
            role: "system",
            content: "You are a medical documentation assistant.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.2,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    const soap = response.data.choices[0].message.content;
    const date = new Date().toLocaleDateString("en-IN");
    await Consultation.create({
      email: email,
      transcription: transcriptValue,
      soap: soap,
      date: date,
      duration: humanizedDuration,
    });
    const consultationData = await Consultation.find({ email: email });
    return res
      .status(200)
      .json({ consultations: [...consultationData].reverse() });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "SOAP generation failed" });
  }
};

export const updateSoap = async (req, res) => {
  const email = jwt.verify(req.cookies.user, process.env.JWT_SECRET).user;
  const { newSoap, id } = req.body;
  await Consultation.updateOne({ _id: id }, { soap: newSoap });
  const consultations = await Consultation.find({ email: email });
  return res
    .status(200)
    .json({ msg: "soap saved", consultations: [...consultations].reverse() });
};

export const enhanceTranscript = async (req, res) => {
  const email = jwt.verify(req.cookies.user, process.env.JWT_SECRET).user;
  const { transcript, id } = req.body;
  const prompt = `You are a medical documentation assistant.

Your task is to ENHANCE the readability of a raw speech-to-text transcript
from a doctor–patient consultation.

IMPORTANT RULES:
- Do NOT add new medical information.
- Do NOT remove any information.
- Do NOT infer diagnoses, medications, or advice that are not explicitly spoken.
- Do NOT correct medical facts.
- Do NOT assume speaker roles unless strongly implied by the sentence itself.

WHAT YOU SHOULD DO:
- Add punctuation.
- Fix obvious speech-to-text errors.
- Break the text into short, readable sentences.
- Separate the conversation into logical conversational turns.
- If speaker roles are reasonably clear, prefix lines with "Doctor:" or "Patient:".
- If speaker role is unclear, leave the line without a role prefix.

STYLE:
- Neutral, clinical, professional.
- No emojis.
- No explanations.
- No summaries.

OUTPUT FORMAT:
- Plain text only.
- Each sentence or turn on a new line.
- No markdown, no bullet points.

This is a readability enhancement only, not a clinical interpretation.

Raw transcript:
${transcript}
`;
  try {
    const response = await axios.post(
      "https://api.perplexity.ai/chat/completions",
      {
        model: "sonar",
        messages: [
          {
            role: "system",
            content: "You are a medical documentation assistant.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.2,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    const AITranscript = response.data.choices[0].message.content;
    await Consultation.updateOne(
      { _id: id },
      { AITranscription: AITranscript }
    );
    const consultations = await Consultation.find({ email: email });
    return res.status(200).json({
      msg: "Transcript AI Enhanced",
      consultations: [...consultations].reverse(),
      AITranscript: AITranscript,
    });
  } catch (e) {
    console.log(e);
  }
};

export const editTitle = async (req, res) => {
  const email = jwt.verify(req.cookies.user, process.env.JWT_SECRET).user;
  const { id, title } = req.body;
  await Consultation.updateOne({ _id: id }, { title: title });
  const consultations = await Consultation.find({ email: email });
  return res.status(200).json({
    msg: "title saved",
    consultations: [...consultations].reverse(),
  });
};

export const deleteConsultation = async (req, res) => {
  const email = jwt.verify(req.cookies.user, process.env.JWT_SECRET).user;
  const id = req.body.id;
  await Consultation.deleteOne({ _id: id });
  const consultations = await Consultation.find({ email: email });
  return res
    .status(200)
    .json({
      msg: "consultation deleted",
      consultations: [...consultations].reverse(),
    });
};

export const share=async(req,res)=>{
  const email = jwt.verify(req.cookies.user, process.env.JWT_SECRET).user;
  const {id,receiverEmail}=req.body;
  if(receiverEmail===email){
    return res.status(405).json({msg:"owner and receiver same"});
  }
  const receiverEmailData=await Account.findOne({email:receiverEmail});
  if(!receiverEmailData){
     return res.status(404).json({msg:"receiver email not  found"});
  }
  let sharedWithMe=[...receiverEmailData.sharedWithMe];
  if(sharedWithMe.includes(id)) {
    return res.status(409).json({msg:"already shared"});
  }
  sharedWithMe.push(id);
  await Account.updateOne({email:receiverEmail},{sharedWithMe:sharedWithMe});

  const userData=await Account.findOne({email:email});
  let sharedWithOther=[...userData.sharedWithOther];
  sharedWithOther.push(id);
  await Account.updateOne({email:email},{sharedWithOther:sharedWithOther});
  
  let consultationData=await Consultation.findOne({_id:id});
  const sharedWith=[...consultationData.sharedwith];
  sharedWith.push(receiverEmail);
  await Consultation.updateOne({_id:id},{sharedwith:sharedWith});
  const consultations=await Consultation.find({email:email});
  
  return res.status(200).json({msg:"shared sucess", consultations:[...consultations].reverse()});
}

export const copyConsultation = async (req, res) => {
  try {
    const email = jwt.verify(req.cookies.user, process.env.JWT_SECRET).user;
    const { id } = req.body;

    const originalConsultation = await Consultation.findById(id);
    if (!originalConsultation) {
      return res.status(404).json({ msg: "Consultation not found" });
    }

    const date = new Date().toLocaleDateString("en-IN");
    await Consultation.create({
      email: email,
      title: originalConsultation.title,
      transcription: originalConsultation.transcription,
      soap: originalConsultation.soap,
      date: date,
      duration: originalConsultation.duration,
      AITranscription: originalConsultation.AITranscription,
      sharedwith: [], 
    });

    const consultations = await Consultation.find({ email: email });
    return res.status(200).json({
      msg: "Consultation copied successfully",
      consultations: [...consultations].reverse(),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Failed to copy consultation" });
  }
};