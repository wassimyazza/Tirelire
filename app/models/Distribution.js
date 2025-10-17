import mongoose from "mongoose";

const distributionSchema = new mongoose.Schema({
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        required: true
    },
    beneficiaryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    round: {
        type: Number,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    distributedAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['completed'],
        default: 'completed'
    }
}, {timestamps: true});

export default mongoose.model('Distribution', distributionSchema);