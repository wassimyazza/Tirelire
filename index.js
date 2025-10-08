import 'dotenv/config';
import express from "express";
import session from "express-session";
import webRoutes from "./routes/web.js";
import connectDB from './app/config/db.js'

const app = express();

connectDB();
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: '8dh3bF9kL2mP5qR7sT1vW4xY6zA3cE', 
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24,
    httpOnly: true,              
    secure: false                  
  }
}));

app.use("/", webRoutes);


app.listen(3001,()=>{
    console.log("App is listning to port 3001");
})