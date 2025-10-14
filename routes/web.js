import express from "express";
import { checkAuth, checkAdmin } from "../app/middleware/auth.js";
import AuthController from "../app/controllers/AuthController.js";
import { upload } from "../app/config/multer.js";
import KycController from "../app/controllers/KycController.js";

const router = express.Router();

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.get("/profile", checkAuth, AuthController.profile);

router.post("/kyc/submit", checkAuth, upload.fields([
    {name: 'cinImage', maxCount: 1},
    {name: 'selfieImage', maxCount: 1}
]), KycController.submit);



export default router;