import express from "express";
import {getSoap, getConsultations} from "../controllers/dashboard.js"

const router=express.Router();

router.post("/get-soap",getSoap);
router.post("/get-consultations",getConsultations);

export default router;