import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amountPerMonth: {
        type: Number,
        required: true,
        min: 0
    },
    totalMembers: {
        type: Number,
        required: true,
        min: 2
    },
    currentRound: {
        type: Number,
        default: 1
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'cancelled'],
        default: 'active'
    }
}, { timestamps: true });

export default mongoose.model('Group', groupSchema);