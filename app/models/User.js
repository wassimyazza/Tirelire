import mongoose from "mongoose";

const userSchema = new mongoose.Schema(data,{timestamps:true});

export default mongoose.model('User', userSchema);