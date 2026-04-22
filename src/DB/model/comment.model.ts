import mongoose, { Schema, Types } from "mongoose"

export enum onModelEnum {
    Post = "Post",
    Comment = "Comment"
}

export interface IComment{

content?:string    
attachment?:string[]
assetFolder?:string

createdBy:Schema.Types.ObjectId

tags?:Schema.Types.ObjectId[]
likes?:Schema.Types.ObjectId[]

refId:Types.ObjectId
onModel:onModelEnum

deletedAt?:Date
deletedBy?:Types.ObjectId

restoedAt?:Date
restoredBy?:Types.ObjectId
}

export const CommentSchema=new Schema<IComment>({
    
content:{type:String,required:function():boolean{ return this.attachment?.length === 0} , minLength:5 , maxLength:10000},    
attachment:[String],
assetFolder:{type:String},

createdBy:{type:Schema.Types.ObjectId,ref:"User",required:true},

refId:{type:Schema.Types.ObjectId,refPath:"onModel",required:true},
onModel:{type:String,enum:onModelEnum,required:true},

tags:[{type:Schema.Types.ObjectId,ref:"User"}],
likes:[{type:Schema.Types.ObjectId,ref:"User"}],

deletedAt:{type:Date},
deletedBy:{type:Schema.Types.ObjectId,ref:"User"},

restoedAt:{type:Date},
restoredBy:{type:Schema.Types.ObjectId,ref:"User"}
},{
    timestamps:true,
    strictQuery:true,
    toJSON:{virtuals:true},
    toObject:{virtuals:true},
})

CommentSchema.virtual("replies",{
    ref:"Comment",
    localField:"_id",
    foreignField:"refId"
})


const CommentModel= mongoose.model<IComment>("Comment",CommentSchema)

export default CommentModel