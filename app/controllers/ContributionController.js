import Contribution from "../models/Contribution.js";
import Group from "../models/Group.js";
import GroupMember from "../models/GroupMember.js";
import Distribution from "../models/Distribution.js";

export default class ContributionController {
    
    static async pay(req, res) {
        try {
            const userId = req.user.userId;
            const {groupId} = req.body;

            const group = await Group.findById(groupId);
            if(!group){
                return res.status(404).json({success: false, message: "Group not found"});
            }

            if(group.status !== 'active'){
                return res.status(400).json({success: false, message: "Group is not active"});
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

            const allPaidContributions = await Contribution.countDocuments({
                groupId,
                round: group.currentRound,
                status: 'paid'
            });

            if(allPaidContributions === group.maxMembers){
                await ContributionController.autoDistribute(groupId, group.currentRound);
            }

            res.status(201).json({
                success: true, 
                message: "Payment recorded", 
                data: contribution,
                allMembersPaid: allPaidContributions === group.maxMembers
            });
        } catch (error) {
            res.status(500).json({success: false, message: "Error recording payment"});
        }
    }

    static async autoDistribute(groupId, round){
        try {
            const group = await Group.findById(groupId);
            if(!group) return;

            const nextBeneficiaryOrder = group.currentBeneficiaryOrder + 1;

            const beneficiary = await GroupMember.findOne({
                groupId,
                order: nextBeneficiaryOrder
            });

            if(!beneficiary) return;

            const totalAmount = group.contributionAmount * group.maxMembers;

            beneficiary.hasReceived = true;
            beneficiary.receivedAt = new Date();
            beneficiary.amountReceived = totalAmount;
            await beneficiary.save();

            const distribution = new Distribution({
                groupId,
                beneficiaryId: beneficiary.userId,
                round,
                amount: totalAmount,
                status: 'completed'
            });

            await distribution.save();

            group.currentBeneficiaryOrder = nextBeneficiaryOrder;

            if(nextBeneficiaryOrder >= group.maxMembers){
                group.status = 'completed';
            } else {
                group.currentRound += 1;
            }

            await group.save();

            console.log(`Auto-distributed ${totalAmount} to user ${beneficiary.userId}`);

        } catch (error) {
            console.log("Error in auto distribution:", error);
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
            res.status(500).json({success: false, message: "Error fetching contributions"});
        }
    }

    static async getRoundStatus(req, res) {
        try {
            const {groupId} = req.params;

            const group = await Group.findById(groupId);
            if(!group){
                return res.status(404).json({success: false, message: "Group not found"});
            }

            const paidCount = await Contribution.countDocuments({
                groupId,
                round: group.currentRound,
                status: 'paid'
            });

            const currentBeneficiary = await GroupMember.findOne({
                groupId,
                order: group.currentBeneficiaryOrder + 1
            }).populate('userId', 'name email');

            const allContributions = await Contribution.find({
                groupId,
                round: group.currentRound
            }).populate('userId', 'name email');

            res.status(200).json({
                success: true,
                data: {
                    currentRound: group.currentRound,
                    totalMembers: group.maxMembers,
                    paidMembers: paidCount,
                    remainingMembers: group.maxMembers - paidCount,
                    nextBeneficiary: currentBeneficiary,
                    contributions: allContributions,
                    isComplete: paidCount === group.maxMembers
                }
            });
        } catch (error) {
            res.status(500).json({success: false, message: "Error fetching round status"});
        }
    }

    static async getDistributions(req, res) {
        try {
            const {groupId} = req.params;
            const distributions = await Distribution.find({groupId})
                .populate('beneficiaryId', 'name email')
                .sort({createdAt: -1});
            res.status(200).json({success: true, count: distributions.length, data: distributions});
        } catch (error) {
            res.status(500).json({success: false, message: "Error fetching distributions"});
        }
    }

    static async getMyDistributions(req, res) {
        try {
            const userId = req.user.userId;
            const distributions = await Distribution.find({beneficiaryId: userId})
                .populate('groupId', 'name contributionAmount')
                .sort({createdAt: -1});
            res.status(200).json({success: true, count: distributions.length, data: distributions});
        } catch (error) {
            res.status(500).json({success: false, message: "Error fetching distributions"});
        }
    }
}