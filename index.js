import 'dotenv/config';
import express from "express";
import webRoutes from "./routes/web.js";
import connectDB from './app/config/db.js'

const app = express();

connectDB();
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

app.use("/", webRoutes);


app.listen(3001,()=>{
    console.log("App is listning to port 3001");
})