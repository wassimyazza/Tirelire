import Group from "../models/Group.js";
import GroupMember from "../models/GroupMember.js";
import User from "../models/User.js";

export default class GroupController {
    
    static async create(req, res) {
        try {
            const userId = req.user.userId;
            const {name, description, contributionAmount, paymentDeadline, maxMembers} = req.body;

            const user = await User.findById(userId);
            if(!user){
                return res.status(404).json({success: false, message: "User not found"});
            }

            if(!user.isVerified){
                return res.status(403).json({success: false, message: "Complete KYC verification first"});
            }

            if(!name){
                return res.status(400).json({success: false, message: "Name is required"});
            }

            if(!contributionAmount){
                return res.status(400).json({success: false, message: "Contribution amount is required"});
            }

            if(!paymentDeadline){
                return res.status(400).json({success: false, message: "Payment deadline is required"});
            }

            if(!maxMembers){
                return res.status(400).json({success: false, message: "Max members is required"});
            }

            const group = new Group({
                name,
                description,
                creatorId: userId,
                contributionAmount,
                paymentDeadline,
                maxMembers,
                currentMembers: 1,
                totalRounds: maxMembers,
                status: 'forming'
            });

            await group.save();

            const groupMember = new GroupMember({
                groupId: group._id,
                userId: userId,
                order: 1
            });

            await groupMember.save();

            res.status(201).json({success: true, message: "Group created", data: group});
        } catch (error) {
            console.log("Error:", error);
            res.status(500).json({success: false, message: error.message});
        }
    }

    static async getAll(req, res) {
        try {
            const groups = await Group.find().populate('creatorId', 'name email').sort({createdAt: -1});
            res.status(200).json({success: true, count: groups.length, data: groups});
        } catch (error) {
            res.status(500).json({success: false, message: "Error fetching groups"});
        }
    }

    static async getById(req, res) {
        try {
            const {groupId} = req.params;
            const group = await Group.findById(groupId).populate('creatorId', 'name email');

            if(!group){
                return res.status(404).json({success: false, message: "Group not found"});
            }

            const members = await GroupMember.find({groupId}).populate('userId', 'name email').sort({order: 1});

            res.status(200).json({success: true, data: {group, members}});
        } catch (error) {
            res.status(500).json({success: false, message: "Error fetching group"});
        }
    }

    static async join(req, res) {
        try {
            const userId = req.user.userId;
            const {groupId} = req.params;

            const user = await User.findById(userId);
            if(!user.isVerified){
                return res.status(403).json({success: false, message: "Complete KYC verification first"});
            }

            const group = await Group.findById(groupId);
            if(!group){
                return res.status(404).json({success: false, message: "Group not found"});
            }

            if(group.currentMembers >= group.maxMembers){
                return res.status(400).json({success: false, message: "Group is full"});
            }

            const existingMember = await GroupMember.findOne({groupId, userId});
            if(existingMember){
                return res.status(400).json({success: false, message: "Already a member"});
            }

            const nextOrder = group.currentMembers + 1;
            const groupMember = new GroupMember({
                groupId,
                userId,
                order: nextOrder
            });

            await groupMember.save();

            group.currentMembers += 1;
            await group.save();

            res.status(200).json({success: true, message: "Joined group", data: groupMember});
        } catch (error) {
            res.status(500).json({success: false, message: "Error joining group"});
        }
    }

    static async getMyGroups(req, res) {
        try {
            const userId = req.user.userId;
            const memberships = await GroupMember.find({userId}).populate('groupId');
            const groups = memberships.map(m => m.groupId);
            res.status(200).json({success: true, count: groups.length, data: groups});
        } catch (error) {
            res.status(500).json({success: false, message: "Error fetching groups"});
        }
    }

    static async startRound(req, res) {
        try {
            const userId = req.user.userId;
            const {groupId} = req.params;

            const group = await Group.findById(groupId);
            if(!group){
                return res.status(404).json({success: false, message: "Group not found"});
            }

            if(group.creatorId.toString() !== userId){
                return res.status(403).json({success: false, message: "Only creator can start round"});
            }

            if(group.currentMembers < group.maxMembers){
                return res.status(400).json({success: false, message: "Group not full yet"});
            }

            if(group.status === 'active'){
                return res.status(400).json({success: false, message: "Round already started"});
            }

            group.currentRound = 1;
            group.status = 'active';
            group.currentBeneficiaryOrder = 0;
            await group.save();

            res.status(200).json({success: true, message: "Round started successfully", data: group});
        } catch (error) {
            res.status(500).json({success: false, message: "Error starting round"});
        }
    }
}