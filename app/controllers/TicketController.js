import Ticket from "../models/Ticket.js";

export default class TicketController {
    
    static async create(req, res) {
        try {
            const userId = req.user.userId;
            const {groupId, subject, description} = req.body;

            if(!subject || !description){
                return res.status(400).json({success: false, message: "Subject and description required"});
            }

            const ticket = new Ticket({
                userId,
                groupId: groupId || null,
                subject,
                description,
                status: 'open'
            });

            await ticket.save();

            res.status(201).json({success: true, message: "Ticket created", data: ticket});
        } catch (error) {
            res.status(500).json({success: false, message: "Error creating ticket"});
        }
    }

    static async getMyTickets(req, res) {
        try {
            const userId = req.user.userId;
            const tickets = await Ticket.find({userId})
                .populate('groupId', 'name')
                .sort({createdAt: -1});
            res.status(200).json({success: true, count: tickets.length, data: tickets});
        } catch (error) {
            res.status(500).json({success: false, message: "Error fetching tickets"});
        }
    }

    static async getAllTickets(req, res) {
        try {
            const tickets = await Ticket.find()
                .populate('userId', 'name email')
                .populate('groupId', 'name')
                .sort({createdAt: -1});
            res.status(200).json({success: true, count: tickets.length, data: tickets});
        } catch (error) {
            res.status(500).json({success: false, message: "Error fetching tickets"});
        }
    }

}