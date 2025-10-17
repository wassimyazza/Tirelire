import express from "express";
import { checkAuth, checkAdmin } from "../app/middleware/auth.js";
import { upload } from "../app/config/multer.js";
import AuthController from "../app/controllers/AuthController.js";
import KycController from "../app/controllers/KycController.js";
import GroupController from "../app/controllers/GroupController.js";
import ContributionController from "../app/controllers/ContributionController.js";
import MessageController from "../app/controllers/MessageController.js";
import TicketController from "../app/controllers/TicketController.js";

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

router.post("/groups", checkAuth, GroupController.create);
router.get("/groups", checkAuth, GroupController.getAll);
router.get("/groups/my", checkAuth, GroupController.getMyGroups);
router.get("/groups/:groupId", checkAuth, GroupController.getById);
router.post("/groups/:groupId/join", checkAuth, GroupController.join);
router.post("/groups/:groupId/start-round", checkAuth, GroupController.startRound);

router.post("/contributions/pay", checkAuth, ContributionController.pay);
router.get("/contributions/group/:groupId", checkAuth, ContributionController.getGroupContributions);
router.get("/contributions/my", checkAuth, ContributionController.getMyContributions);
router.post("/contributions/distribute/:groupId", checkAuth, ContributionController.distribute);

router.post("/messages/send", checkAuth, MessageController.send);
router.get("/messages/group/:groupId", checkAuth, MessageController.getGroupMessages);

router.post("/tickets", checkAuth, TicketController.create);
router.get("/tickets/my", checkAuth, TicketController.getMyTickets);
router.get("/tickets/all", checkAuth, checkAdmin, TicketController.getAllTickets);

export default router;