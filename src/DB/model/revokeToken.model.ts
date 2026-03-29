import mongoose from "mongoose";
import  { Types } from "mongoose";


export interface IRevokeToken {
    userId?:Types.ObjectId;
    tokenId?:string; 
    expiresAt:Date;  
}

const RevokeTokenSchema=new mongoose.Schema<IRevokeToken>({
    userId:{type:Types.ObjectId,required:true,ref:"User"},
    tokenId:{type:String,required:true},
    expiresAt:{type:Date,required:true},
},
{
    timestamps:true,
    toObject:{ virtuals:true},
    toJSON:{ virtuals:true},  
})


const revokeTokenModel= mongoose.model<IRevokeToken>("RevokeToken",RevokeTokenSchema)
export default revokeTokenModel