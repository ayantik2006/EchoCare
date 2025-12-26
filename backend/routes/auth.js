import express from "express";
import { login, checkLogin, signout } from "../controllers/auth.js";

const router=express.Router();

router.post("/login",login);
router.post("/check-login",checkLogin);
router.post("/signout",signout);

export default router;
