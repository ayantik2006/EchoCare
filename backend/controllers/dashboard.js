import Consultation from "../models/Consultation.js";
import jwt from "jsonwebtoken";
import axios from "axios";
import humanizeDuration from "humanize-duration";

export const getConsultations = async (req, res) => {
  const email = jwt.verify(req.cookies.user, process.env.JWT_SECRET).user;
  const consultationData = await Consultation.find({ email: email });
  return res
    .status(200)
    .json({ consultations: [...consultationData].reverse() });
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
    return res
      .status(200)
      .json({
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
  return res
    .status(200)
    .json({
      msg: "title saved",
      consultations: [...consultations].reverse(),
    });
};
