import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    }
},{timestamps:true});

export default mongoose.model('Group', groupSchema);