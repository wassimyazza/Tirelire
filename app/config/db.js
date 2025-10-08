
import mongoose from "mongoose";

const connectDB = async ()=>{
    try{
        mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to database");
    }catch(err){
        console.log("error",err);
        process.exit(1);
    }
}

export default connectDB;