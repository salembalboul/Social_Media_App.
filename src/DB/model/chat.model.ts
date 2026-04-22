import mongoose, { Schema, Types,model} from "mongoose"


export interface Imessage {

content: string
createdBy: Types.ObjectId

createdAt?: Date
updatedAt?: Date

}

export interface Ichat {
 
//ovo    
participants: Types.ObjectId[]
createdBy: Types.ObjectId
messages: Imessage[]

//ovm
group?: string
groupImage?: string
roomId?: string

createdAt: Date
updatedAt: Date
}

const messageSchema = new Schema<Imessage>({
    content: {type: String, required: true},
    createdBy: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
},
{
    timestamps:true
})


const chatSchema = new Schema<Ichat>({
    participants: [{type: mongoose.Schema.Types.ObjectId, ref: "User", required: true}],
    createdBy: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    messages: [messageSchema],
    group: {type: String},
    groupImage: {type: String},
    roomId: {type: String}
},{
    timestamps:true
})


const ChatModel= model<Ichat>("Chat",chatSchema)

export default ChatModel