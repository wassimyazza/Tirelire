import Kyc from "../models/Kyc.js";
import User from "../models/User.js";

export default class KycController {
    
    static async submit(req, res) {
        try {
            const userId = req.user.userId;
            const {cinNumber} = req.body;
            
            const existingKyc = await Kyc.findOne({userId});
            if(existingKyc){
                return res.status(400).json({success: false, message: "KYC already submitted"});
            }

            if(!req.files || !req.files.cinImage || !req.files.selfieImage){
                return res.status(400).json({success: false, message: "CIN and selfie images required"});
            }

            const kyc = new Kyc({
                userId,
                cinNumber,
                cinImage: req.files.cinImage[0].path,
                selfieImage: req.files.selfieImage[0].path,
                status: 'pending'
            });

            await kyc.save();

            res.status(201).json({success: true, message: "KYC submitted successfully", data: kyc});
        } catch (error) {
            res.status(500).json({success: false, message: "Error submitting KYC"});
        }
    }

    static async getStatus(req, res) {
        try {
            const userId = req.user.userId;
            const kyc = await Kyc.findOne({userId});

            if(!kyc){
                return res.status(404).json({success: false, message: "No KYC found"});
            }

            res.status(200).json({success: true, data: kyc});
        } catch (error) {
            res.status(500).json({success: false, message: "Error fetching KYC"});
        }
    }

    static async getAll(req, res) {
        try {
            const kycRequests = await Kyc.find().populate('userId', 'name email').sort({createdAt: -1});
            res.status(200).json({success: true, count: kycRequests.length, data: kycRequests});
        } catch (error) {
            res.status(500).json({success: false, message: "Error fetching KYC requests"});
        }
    }

    static async updateStatus(req, res) {
        try {
            const {kycId} = req.params;
            const {status} = req.body;

            if(!['approved', 'rejected'].includes(status)){
                return res.status(400).json({success: false, message: "Invalid status"});
            }

            const kyc = await Kyc.findById(kycId);
            if(!kyc){
                return res.status(404).json({success: false, message: "KYC not found"});
            }

            kyc.status = status;
            await kyc.save();

            if(status === 'approved'){
                await User.findByIdAndUpdate(kyc.userId, {isVerified: true});
            }

            res.status(200).json({success: true, message: `KYC ${status}`, data: kyc});
        } catch (error) {
            res.status(500).json({success: false, message: "Error updating KYC"});
        }
    }
}