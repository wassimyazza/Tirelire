import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    creatorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    contributionAmount: {
        type: Number,
        required: true
    },
    paymentDeadline: {
        type: Number,
        required: true
    },
    maxMembers: {
        type: Number,
        required: true
    },
    currentMembers: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['forming', 'active', 'completed'],
        default: 'forming'
    },
    currentRound: {
        type: Number,
        default: 0
    },
    totalRounds: {
        type: Number,
        default: 0
    },
    currentBeneficiaryOrder: {
        type: Number,
        default: 0
    }
}, {timestamps: true});

export default mongoose.model('Group', groupSchema);