import User from "../models/User.js";
import bcrypt, { hash } from "bcrypt";
export default class AuthController{

    static async register(req,res){
        const name = req.body.name;
        const email = req.body.email;
        const password = req.body.password;
        const ConfirmPassword = req.body.confirmPassword;
        const role = req.body.role;

        const errors = [];

        if(!name){
            errors.push("Name is required!");
        }
        if(!email){
            errors.push("Email is required!");
        }
        if(!password){
            errors.push("Password is required!");
        }
        if(password != ConfirmPassword){
            errors.push("Confirm password is incorrect!");
        }
        if(role != "user" && role != "admin"){
            errors.push("Invalid role!");
        }

        if(errors.length > 0){
            return res.status(400).json({error: errors});
        }

        const checkEmail = await User.findOne({email: email});
        if(checkEmail){
            return res.status(400).json({
                message: "Email already exict!"
            })
        }
        const hashedPassword = await bcrypt.hash(password,10);

        const user = new User({
            name: name,
            email: email,
            password: hashedPassword,
            role: role
        });

        await user.save();

        req.session.userId = user._id;
        req.session.email = user.email;

        const userResponse = user.toObject();
        return res.status(201).json(userResponse);
    }   

    static async login(req, res){
        const email = req.body.email;
        const password = req.body.password;
        const errors = [];
        if(!email){
            errors.push("Email is required!");
        }
        if(!password){
            errors.push("Password is required!");
        }
        if(errors.length >0){
            return res.status(400).json({"errors": errors});
        }
        const checkExict = await User.findOne({email: email});
        if(!checkExict){
            return res.status(400).json({message: "Email doesn't exict!"});
        }
        const getPassword = checkExict.password;
        const checkPassword = await bcrypt.compare(password, getPassword);
        if(!checkPassword){
            return res.status(400).json({message: "Invalid Email or Password!"});
        }

        req.session.userId = checkExict.id;
        req.session.password = checkExict.password;

        return res.status(200).json({"message": "Login Successfuly!"});

    }

}