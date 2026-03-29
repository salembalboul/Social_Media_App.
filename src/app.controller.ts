import {config} from "dotenv";
import {resolve} from "path"
config({path:resolve('./config/.env')})

import express ,{Request,Response,NextFunction } from "express";
export const app:express.Application = express()

import cors from 'cors'; 
import helmet from 'helmet'
import {rateLimit} from 'express-rate-limit'
import { appError } from "./utils/classError.js";
import userRouter from "./users/user.controller.js";
import connectionDB from "./DB/connectionDB.js";   
import UserModel, { GenderType } from "./DB/model/user.model.js";
import { v4 as uuidv4 } from 'uuid';
import { UserRebository } from "./DB/rebositories/user.rebos.js";

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message:"Too many requests from this IP, please try again after 15 minutes"
    ,statusCode:429,
    legacyHeaders:false,
    skipFailedRequests:true,
    skipSuccessfulRequests:true

})

const port:string|number=process.env.PORT||5000

const bootstrap = async()=>{
    
    app.use(express.json())
    app.use(cors())
    app.use(helmet())
    app.use(limiter)
    
await connectionDB()


app.get("/",(req:Request,res:Response,next:NextFunction)=>{
    return res.status(200).send({mesage:"welcome to the social media welcome on my social media app...........❤️"})
})
app.use("/users",userRouter)


app.use("{/*demo}",(req:Request,res:Response,next:NextFunction)=>{
throw new appError(`invalid url  ${req.originalUrl}`,404)})

app.use((error:appError,req:Request,res:Response,next:NextFunction)=>{
    return res.status(error.statusCode as unknown as number ||500).json({message:error.message,stack:error.stack})
})


app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
})
}
export default bootstrap