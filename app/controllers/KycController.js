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

    
}