import Group from "../models/Group.js";
import GroupMember from "../models/GroupMember.js";
import User from "../models/User.js";

export default class GroupController {
    
    static async create(req, res) {
        try {
            const userId = req.user.userId;
            const {name, description, contributionAmount, paymentDeadline, maxMembers} = req.body;

            const user = await User.findById(userId);
            if(!user.isVerified){
                return res.status(403).json({success: false, message: "Complete KYC verification first"});
            }

            if(!name || !contributionAmount || !paymentDeadline || !maxMembers){
                return res.status(400).json({success: false, message: "All fields required"});
            }

            const group = new Group({
                name,
                description,
                creatorId: userId,
                contributionAmount,
                paymentDeadline,
                maxMembers,
                currentMembers: 1,
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
            res.status(500).json({success: false, message: "Error creating group"});
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
            if(group.currentMembers === group.maxMembers){
                group.status = 'active';
            }
            await group.save();

            res.status(200).json({success: true, message: "Joined group", data: groupMember});
        } catch (error) {
            res.status(500).json({success: false, message: "Error joining group"});
        }
    }

}