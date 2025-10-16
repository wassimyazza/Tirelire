import Message from "../models/Message.js";
import GroupMember from "../models/GroupMember.js";

export default class MessageController {
    
    static async send(req, res) {
        try {
            const userId = req.user.userId;
            const {groupId, content} = req.body;

            const member = await GroupMember.findOne({groupId, userId});
            if(!member){
                return res.status(403).json({success: false, message: "Not a member of this group"});
            }

            const message = new Message({
                groupId,
                senderId: userId,
                content,
                messageType: 'text'
            });

            await message.save();

            const populatedMessage = await Message.findById(message._id).populate('senderId', 'name email');

            res.status(201).json({success: true, message: "Message sent", data: populatedMessage});
        } catch (error) {
            res.status(500).json({success: false, message: "Error sending message"});
        }
    }

}