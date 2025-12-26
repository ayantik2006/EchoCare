import Account from "../models/Account.js";
import jwt from "jsonwebtoken";

const createCookie = async (res, token) => {
  const isProduction = !(process.env.FRONTEND_URL === "http://localhost:5173");
  res.cookie("user", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 15 * 24 * 60 * 60 * 1000,
  });
};

const deleteCookie = async (res) => {
  const isProduction = !(process.env.FRONTEND_URL === "http://localhost:5173");
  res.clearCookie("user", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  });
};

export const login = async (req, res) => {
  const { email, name } = req.body;
  const userData = await Account.findOne({ email: email });
  if (userData !== null) {
    const token = jwt.sign({ user: email }, process.env.JWT_SECRET, {
      expiresIn: "15d",
    });
    createCookie(res, token);
    return res.status(200).json({ msg: "login success" });
  }

  await Account.create({ email: email, name: name });
  const token = jwt.sign({ user: email }, process.env.JWT_SECRET, {
    expiresIn: "15d",
  });
  createCookie(res, token);
  return res.status(200).json({ msg: "account created and login success" });
};

export const checkLogin = async (req, res) => {
  if (!req.cookies.user) {
    return res.status(401).json({ msg: "unauthorized" });
  }
  const email = jwt.verify(req.cookies.user, process.env.JWT_SECRET).user;
  const userData = await Account.findOne({ email: email });
  return res.status(200).json({ msg: "authorized", docName:userData.name });
};

export const signout = async (req, res) => {
  if (!req.cookies.user) {
    return res.status(200).json({ msg: "logged out" });
  }
  deleteCookie(res);
  return res.status(200).json({ msg: "logged out" });
};

export const health=(req,res)=>{
  res.status(200).json({msg:"running"});
}