import User from "../models/User.js";
import bcrypt from "bcrypt";
import { generateToken } from '../utils/jwt.js';

export default class AuthController{

    static async register(req,res){
        const {name, email, password, confirmPassword, role} = req.body;
        const errors = [];

        if(!name) errors.push("Name is required!");
        if(!email) errors.push("Email is required!");
        if(!password) errors.push("Password is required!");
        if(password != confirmPassword) errors.push("Passwords do not match!");
        if(role && role != "user" && role != "admin") errors.push("Invalid role!");

        if(errors.length > 0){
            return res.status(400).json({success: false, errors});
        }

        const checkEmail = await User.findOne({email});
        if(checkEmail){
            return res.status(400).json({success: false, message: "Email already exists!"});
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            name,
            email,
            password: hashedPassword,
            role: role || "user"
        });

        await user.save();
        const token = generateToken(user);

        return res.status(201).json({
            success: true,
            message: "Registration successful!",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified
            }
        });
    }   

    static async login(req, res){
        const {email, password} = req.body;
        const errors = [];

        if(!email) errors.push("Email is required!");
        if(!password) errors.push("Password is required!");

        if(errors.length > 0){
            return res.status(400).json({success: false, errors});
        }

        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({success: false, message: "Invalid credentials!"});
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(400).json({success: false, message: "Invalid credentials!"});
        }

        const token = generateToken(user);

        return res.status(200).json({
            success: true,
            message: "Login successful!",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified
            }
        });
    }

    static async profile(req, res){
        try{
            const user = await User.findById(req.user.userId).select('-password');
            if(!user){
                return res.status(404).json({success: false, message: "User not found"});
            }
            res.status(200).json({success: true, data: user});
        }catch(err){
            res.status(500).json({success: false, message: "Server error"});
        }
    }
}