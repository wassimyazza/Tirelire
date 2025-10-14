import express from "express";
import { checkAuth, checkAdmin } from "../app/middleware/auth.js";
import { upload } from "../app/config/multer.js";
import AuthController from "../app/controllers/AuthController.js";
import KycController from "../app/controllers/KycController.js";

const router = express.Router();

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.get("/profile", checkAuth, AuthController.profile);

router.post("/kyc/submit", checkAuth, upload.fields([
    {name: 'cinImage', maxCount: 1},
    {name: 'selfieImage', maxCount: 1}
]), KycController.submit);
router.get("/kyc/status", checkAuth, KycController.getStatus);
router.get("/kyc/all", checkAuth, checkAdmin, KycController.getAll);
router.put("/kyc/:kycId/status", checkAuth, checkAdmin, KycController.updateStatus);

export default router;