import User from "../models/User.js";
import Group from "../models/Group.js";
import Contribution from "../models/Contribution.js";
import Ticket from "../models/Ticket.js";

export default class AdminController {
    
    static async dashboard(req, res) {
        try {
            const totalUsers = await User.countDocuments();
            const verifiedUsers = await User.countDocuments({isVerified: true});
            const totalGroups = await Group.countDocuments();
            const activeGroups = await Group.countDocuments({status: 'active'});
            const completedGroups = await Group.countDocuments({status: 'completed'});
            const totalContributions = await Contribution.countDocuments();
            const openTickets = await Ticket.countDocuments({status: 'open'});
            const inProgressTickets = await Ticket.countDocuments({status: 'in_progress'});

            const recentUsers = await User.find()
                .select('-password')
                .sort({createdAt: -1})
                .limit(5);

            const recentGroups = await Group.find()
                .populate('creatorId', 'name email')
                .sort({createdAt: -1})
                .limit(5);

            res.status(200).json({
                success: true,
                data: {
                    stats: {
                        totalUsers,
                        verifiedUsers,
                        totalGroups,
                        activeGroups,
                        completedGroups,
                        totalContributions,
                        openTickets,
                        inProgressTickets
                    },
                    recentUsers,
                    recentGroups
                }
            });
        } catch (error) {
            res.status(500).json({success: false, message: "Error fetching dashboard"});
        }
    }

    static async getAllUsers(req, res) {
        try {
            const users = await User.find().select('-password').sort({createdAt: -1});
            res.status(200).json({success: true, count: users.length, data: users});
        } catch (error) {
            res.status(500).json({success: false, message: "Error fetching users"});
        }
    }

    static async deleteUser(req, res) {
        try {
            const {userId} = req.params;
            await User.findByIdAndDelete(userId);
            res.status(200).json({success: true, message: "User deleted"});
        } catch (error) {
            res.status(500).json({success: false, message: "Error deleting user"});
        }
    }

    static async getAllGroups(req, res) {
        try {
            const groups = await Group.find()
                .populate('creatorId', 'name email')
                .sort({createdAt: -1});
            res.status(200).json({success: true, count: groups.length, data: groups});
        } catch (error) {
            res.status(500).json({success: false, message: "Error fetching groups"});
        }
    }
}