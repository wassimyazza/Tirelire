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

    static async updateStatus(req, res) {
        try {
            const {ticketId} = req.params;
            const {status} = req.body;

            if(!['open', 'in_progress', 'resolved', 'closed'].includes(status)){
                return res.status(400).json({success: false, message: "Invalid status"});
            }

            const ticket = await Ticket.findById(ticketId);
            if(!ticket){
                return res.status(404).json({success: false, message: "Ticket not found"});
            }

            ticket.status = status;
            await ticket.save();

            res.status(200).json({success: true, message: "Ticket updated", data: ticket});
        } catch (error) {
            res.status(500).json({success: false, message: "Error updating ticket"});
        }
    }

    static async respond(req, res) {
        try {
            const userId = req.user.userId;
            const {ticketId} = req.params;
            const {message} = req.body;

            const ticket = await Ticket.findById(ticketId);
            if(!ticket){
                return res.status(404).json({success: false, message: "Ticket not found"});
            }

            ticket.responses.push({
                responderId: userId,
                message,
                createdAt: new Date()
            });

            await ticket.save();

            res.status(200).json({success: true, message: "Response added", data: ticket});
        } catch (error) {
            res.status(500).json({success: false, message: "Error responding to ticket"});
        }
    }
}