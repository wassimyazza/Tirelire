
export default class AuthController{

    static register(req,res){
        const name = req.body.name.trim();
        const email = req.body.email.trim();
        const password = req.body.password.trim();
        const role = req.body.role.trim();

        const errors = [];

        if(!name){
            errors.push("Name is required!");
        }
        if(!email){
            errors.push("Email is required!");
        }
        if(!password || password.length < 6){
            errors.push("Password is required!");
        }
        if(role != "user" && role != "admin"){
            errors.push("Invalid role!");
        }

        
        
    }   
    
}