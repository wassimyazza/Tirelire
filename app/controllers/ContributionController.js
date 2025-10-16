import Contribution from "../models/Contribution.js";
import Group from "../models/Group.js";
import GroupMember from "../models/GroupMember.js";

export default class ContributionController {
    
    static async pay(req, res) {
        try {
            const userId = req.user.userId;
            const {groupId} = req.body;

            const group = await Group.findById(groupId);
            if(!group){
                return res.status(404).json({success: false, message: "Group not found"});
            }

            const member = await GroupMember.findOne({groupId, userId});
            if(!member){
                return res.status(404).json({success: false, message: "Not a member"});
            }

            const existingContribution = await Contribution.findOne({
                groupId,
                userId,
                round: group.currentRound,
                status: 'paid'
            });

            if(existingContribution){
                return res.status(400).json({success: false, message: "Already paid for this round"});
            }

            const contribution = new Contribution({
                groupId,
                userId,
                amount: group.contributionAmount,
                round: group.currentRound,
                status: 'paid',
                paidAt: new Date()
            });

            await contribution.save();

            member.totalPaid += group.contributionAmount;
            member.reliabilityScore = Math.min(100, member.reliabilityScore + 5);
            await member.save();

            res.status(201).json({success: true, message: "Payment recorded", data: contribution});
        } catch (error) {
            res.status(500).json({success: false, message: "Error recording payment"});
        }
    }

    static async getGroupContributions(req, res) {
        try {
            const {groupId} = req.params;
            const contributions = await Contribution.find({groupId})
                .populate('userId', 'name email')
                .sort({createdAt: -1});
            res.status(200).json({success: true, count: contributions.length, data: contributions});
        } catch (error) {
            res.status(500).json({success: false, message: "Error fetching contributions"});
        }
    }

    static async getMyContributions(req, res) {
        try {
            const userId = req.user.userId;
            
            const contributions = await Contribution.find({userId})
                .populate('groupId', 'name contributionAmount')
                .sort({createdAt: -1});
                
            res.status(200).json({success: true, count: contributions.length, data: contributions});
        } catch (error) {
            console.log("Error:", error);
            res.status(500).json({success: false, message: "Error fetching contributions"});
        }
    }

}