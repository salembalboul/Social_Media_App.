import { NextFunction, Request, Response } from "express";
import { Server, Socket } from "socket.io";
import { createGroupValidationType, getChatValidationType } from "./chat.validation.js";
import chatModel, { Ichat } from "../../DB/model/chat.model.js";
import { ChatRebository } from "../../DB/rebositories/chat.repo.js";
import userModel from "../../DB/model/user.model.js";
import { UserRebository } from "../../DB/rebositories/user.rebos.js";
import { appError } from "../../utils/classError.js";
import { connectionSockets } from "../gateway/gateway.js";
import { Types } from "mongoose";
import cloudinary from "../../utils/cloudinary/index.js";
import { v4 as uuidv4 } from "uuid";

export class ChatService {
    private _chatModel =new ChatRebository(chatModel);
    private _userModel =new UserRebository(userModel);
    constructor() {}

//=====================rest api==========================
//===get chat===
getChat=async (req:Request,res:Response,next:NextFunction)=>{
const {userId}:getChatValidationType= req.params as getChatValidationType;

const chat =await this._chatModel.findOne({
    participants: { $all: [ userId , req?.user?._id! ] } ,
    group: {$exists: false}
},{
    messages:{$slice:[-5,5]}
},
{ populate : [ { path:"participants" } ] }
);
if(!chat){
throw new appError("chat not found", 404);
}

return res.status(200).json({message:"get chat", chat  } );
}

//===create group chat===
createGroup = async (req: Request, res: Response, next: NextFunction) => {
 try {
 
 let { group, participants }: createGroupValidationType = req.body as createGroupValidationType;
 const createdBy = req.user?._id as Types.ObjectId;

 const participantsIds = participants.map((id: string) => Types.ObjectId.createFromHexString(id));

const isSelfAdded = participantsIds.some((id) => id.equals(createdBy)  );
if (isSelfAdded) { 
    return next(new appError("you can't add yourself to the group", 400) ); }

const users = await this._userModel.find({
filter:{
       _id: { $in: participantsIds ,},
       friends: { $in: [createdBy] },
        }
});

if (!users) { 
    return next(new appError("users not found", 404)); 
}

//check if group name is already exist
const isGroupExist = await this._chatModel.findOne({ group });

if (isGroupExist) {
return next(new appError("group name is already exist", 400));
}

let roomId = group.replaceAll(/\s+/g, "-") + "-" + uuidv4();

const attachmentFile = req.file as Express.Multer.File;
let arrUrl: string[] = []

if (attachmentFile) {
 const {secure_url} = await cloudinary.uploader.upload(attachmentFile.path, {
 folder: `social-media/chats/groupImages/${roomId}`,
})

 arrUrl.push(secure_url)
}

participantsIds.push(createdBy);

const groupChat = await this._chatModel.create({
     group,
     participants: participantsIds,
     groupImage: arrUrl[0] || "",
     roomId,
     createdBy,
     messages: [],
 }) as unknown as Ichat;

 if (!groupChat) {
     if (arrUrl[0]) {
         await cloudinary.uploader.destroy(arrUrl[0]);
     }
     return next(new appError("group chat not created", 500));
 }
// console.log(groupChat?.groupImage)

 
 return res.status(201).json({message: "group chat created",data: { groupChat }});
 
} 
catch (error) {
    next(error);
}
};

//=========getGroupChats=========
getGroupChats= async(req:Request,res:Response,next:NextFunction)=>{

const {groupId} = req.params as unknown as {groupId:string};

const chat = await this._chatModel.findOne({
        _id: groupId,
        participants: { $in: [req?.user?._id!] },
        group: { $exists: true }
},{
    messages:{$slice: [-5,5]}
},
{
    populate:[
        {
        path:"messages.createdBy"
    }
]
}
);
if(!chat){
    throw new appError("chat not found", 404);
}
return res.status(200).json({message: "success", chat});
}


//=====================socket io==========================
sayHi= async(data:any,callback:any,socket:Socket,io:Server)=>{
    console.log(data);
}

sendMessage= async(data:any,socket:Socket,io:Server)=>{
const {content ,sendTo}=data;
const createdBy = socket?.data?.user?._id;

//console.log({content,sendTo,createdBy});

const user =await this._userModel.findOne({
    _id:sendTo ,
    friends: { $in :[ createdBy ] }
});

if(!user){
throw new appError("user not found",404);   
}
if(!content || !sendTo){
    return new appError("content and sendTo are required",400);
}

//in case chat exists
const chat =await this._chatModel.findOneAndUpdate(
 {
  participants: { $all: [ sendTo , createdBy ] } ,
  group: {$exists: false}
 },
 { $push:  { messages: {content,createdBy } },},

 { new: true }
 );

 //in case chat not exists
if(!chat){
const newChat = await this._chatModel.create({
        
  participants: [ sendTo , createdBy ] ,
  createdBy,
  messages: [ {
       content,
       createdBy } ]
})
    if(!newChat){
        throw new appError("failed to create chat",500);
    }
}

io.to(connectionSockets.get(createdBy.toString())!).emit('successMessage',{content});
io.to(connectionSockets.get(sendTo.toString())!).emit('newMessage',{ content ,from: socket.data.user});

}

join_room= async(data:any,socket:Socket,io:Server)=>{
    
const {roomId}=data;
const userId = socket?.data?.user?._id;

const chat = await this._chatModel.findOne({
     roomId,
     participants: { $in: [ userId ] },
     group: {$exists: true}  
     
    });
if(!chat){
  throw new appError("chat not found",404);
}
socket.join(chat?.roomId!);
console.log(`User joined room: ${chat?.roomId}`);
}

sendGroupMessage = async(data:any,socket:Socket,io:Server)=>{

const {content,groupId} = data;
const createdBy = socket?.data?.user?._id;

const chat = await this._chatModel.findOneAndUpdate(
{  _id: groupId ,
    participants: { $in: [ createdBy ] },
    group: { $exists: true }
},
{ 
    $push: 
    { messages: 
        { content,
         createdBy 
        } 
    }
 },
 );
 
 if(!chat){
     throw new appError("failed to send message",404);
 }
 
io.to(connectionSockets.get(createdBy.toString())!).emit('successMessage',{content});
io.to(chat?.roomId!).emit('newMessage',{ content ,from: socket.data.user,groupId});

}

}