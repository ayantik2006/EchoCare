import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import auth from "./routes/auth.js";
import dashboard from "./routes/dashboard.js";
import connectMongodb from "./config/db.js";
import cookieParser from "cookie-parser";

dotenv.config()
const app = express();
connectMongodb();

const FRONTEND_URL = process.env.FRONTEND_URL;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.JWT_SECRET));
app.use(cors({
  origin: FRONTEND_URL,
  methods: ["POST", "GET"],
  credentials: true
}))

app.use("/auth", auth);
app.use("/dashboard", dashboard);

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`server live at http://localhost:${PORT}`);
  
});
