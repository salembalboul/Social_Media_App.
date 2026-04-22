 import mongoose, { Schema ,Types} from "mongoose"

export enum AvailablityEnum{
    public="public",
    private="private",
    friends="friends"
}

export enum AllowCommentEnum{
    allow="allow",
    disallow="disallow"
}

export interface IPost{

content?:string    
attachment?:string[]
assetFolder?:string

createdBy:Schema.Types.ObjectId

tags?:Schema.Types.ObjectId[]
likes?:Schema.Types.ObjectId[]

allowComment?:AllowCommentEnum
availablity?:AvailablityEnum

deletedAt?:Date
deletedBy?:Schema.Types.ObjectId

restoedAt?:Date
restoredBy?:Schema.Types.ObjectId
}

export const PostSchema=new Schema<IPost>({
    
content:{type:String,required:function():boolean{ return this.attachment?.length === 0} , minLength:5 , maxLength:10000},    
attachment:[String],
assetFolder:{type:String},

createdBy:{type:Schema.Types.ObjectId,ref:"User",required:true},

tags:[{type:Schema.Types.ObjectId,ref:"User"}],
likes:[{type:Schema.Types.ObjectId,ref:"User"}],

allowComment:{type:String,enum:AllowCommentEnum,default:AllowCommentEnum.allow},
availablity:{type:String,enum:AvailablityEnum,default:AvailablityEnum.public},

deletedAt:{type:Date},
deletedBy:{type:Schema.Types.ObjectId,ref:"User"},

restoedAt:{type:Date},
restoredBy:{type:Schema.Types.ObjectId,ref:"User"}
},{
    timestamps:true,
    toJSON:{virtuals:true},
    toObject:{virtuals:true},
    strictQuery:true
})

PostSchema.pre(["findOne","find","findOneAndDelete","findOneAndUpdate"],async function(){
const query = this.getQuery()
const {paranoid ,...rest}=query
if(paranoid === false){
    this.setQuery({...rest})
}else{
    this.setQuery({...rest,deletedAt:{$exists:false}})
}
}
)
PostSchema.virtual("comments",{
ref:"Comment",
localField:"_id",
foreignField:"refId"
})


const PostModel= mongoose.model<IPost>("Post",PostSchema)

export default PostModel