import mongoose from "mongoose";

const kycSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    cinNumber: {
        type: String,
        required: true
    },
    cinImage: {
        type: String,
        required: true
    },
    selfieImage: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    }
}, { timestamps: true });

export default mongoose.model('Kyc', kycSchema);