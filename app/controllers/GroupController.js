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

}