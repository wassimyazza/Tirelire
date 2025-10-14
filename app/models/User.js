import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    role: {
        type: String,
        enum: ['user', 'admin'],  
        default: 'user'          
    },
    isVerified: {
        type: Boolean,
        default: false
    }
},{timestamps:true});

export default mongoose.model('User', userSchema);