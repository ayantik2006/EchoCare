import express from "express";
import {getSoap, getConsultations, updateSoap, enhanceTranscript, editTitle, deleteConsultation, share, getSharedConsultations, copyConsultation} from "../controllers/dashboard.js";

const router=express.Router();

router.post("/get-soap",getSoap);
router.post("/get-consultations",getConsultations);
router.post("/update-soap",updateSoap);
router.post("/enhance-transcript",enhanceTranscript);
router.post("/edit-title",editTitle);
router.post("/edit-title",editTitle);
router.post("/delete-consultation",deleteConsultation);
router.post("/share",share);
router.post("/get-shared-consultations", getSharedConsultations);
router.post("/copy-consultation", copyConsultation);

export default router;