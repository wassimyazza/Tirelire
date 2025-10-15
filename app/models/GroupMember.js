import mongoose from "mongoose";

const groupMemberSchema = new mongoose.Schema({
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    order: {
        type: Number,
        required: true
    },
    hasReceived: {
        type: Boolean,
        default: false
    },
    totalPaid: {
        type: Number,
        default: 0
    },
    reliabilityScore: {
        type: Number,
        default: 100,
        min: 0,
        max: 100
    },
    joinedAt: {
        type: Date,
        default: Date.now
    }
}, {timestamps: true});

export default mongoose.model('GroupMember', groupMemberSchema);