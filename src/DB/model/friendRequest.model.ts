import mongoose, { Schema, Types } from "mongoose"

export interface IFriendRequest{

createdBy:Types.ObjectId
sendTo:Types.ObjectId

acceptedAt:Date

}

export const FriendRequestSchema=new Schema<IFriendRequest>({
    
createdBy:{type:Schema.Types.ObjectId,ref:"User",required:true},

sendTo:{type:Schema.Types.ObjectId,ref:"User",required:true},

acceptedAt:{type:Date},

},{
    timestamps:true,
    strictQuery:true,
})

FriendRequestSchema.pre(["findOne","find","findOneAndDelete","findOneAndUpdate"],async function(){
const query = this.getQuery()
const {paranoid ,...rest}=query
if(paranoid === false){
    this.setQuery({...rest})
}else{
    this.setQuery({...rest,deletedAt:{$exists:false}})
} 
} )

const FriendRequestModel= mongoose.model<IFriendRequest>("FriendRequest",FriendRequestSchema)

export default FriendRequestModel