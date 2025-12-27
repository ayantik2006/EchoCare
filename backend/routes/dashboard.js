import express from "express";
import {getSoap, getConsultations, updateSoap, enhanceTranscript, editTitle} from "../controllers/dashboard.js";

const router=express.Router();

router.post("/get-soap",getSoap);
router.post("/get-consultations",getConsultations);
router.post("/update-soap",updateSoap);
router.post("/enhance-transcript",enhanceTranscript);
router.post("/edit-title",editTitle);

export default router;