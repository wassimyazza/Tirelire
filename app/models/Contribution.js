import mongoose from "mongoose";

const contributionSchema = new mongoose.Schema({
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
    amount: {
        type: Number,
        required: true
    },
    round: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'paid', 'late'],
        default: 'pending'
    },
    paidAt: {
        type: Date
    }
}, {timestamps: true});

export default mongoose.model('Contribution', contributionSchema);