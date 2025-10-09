import express from "express";
import { checkAuth } from "../app/middleware/auth.js";
import AuthController from "../app/controllers/AuthController.js";

const router = express.Router();



router.post("/register",AuthController.register);
router.post("/login", AuthController.login);

router.get("/profile", checkAuth,AuthController.profile);

export default router;