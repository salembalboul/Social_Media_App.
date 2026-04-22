import { NextFunction, Request, Response } from "express"
import PostModel, { AllowCommentEnum, IPost } from "../../DB/model/post.model.js"
import { PostRebository } from "../../DB/rebositories/post.repo.js"
import { UserRebository } from "../../DB/rebositories/user.rebos.js"
import UserModel from "../../DB/model/user.model.js"
import { appError } from "../../utils/classError.js"
import cloudinary from "../../utils/cloudinary/index.js"
import { v4 as uuidv4 } from "uuid"

import { CommentRebository } from "../../DB/rebositories/comment.repo.js"
import CommentModel, { IComment, onModelEnum } from "../../DB/model/comment.model.js"
import { createCommentValidationParamsType, createCommentValidationType } from "./comment.validation.js"
import { HydratedDocument, Types } from "mongoose"
import { AvailablityPost } from "../post/post.service.js"

export class CommentService{

  private _postModel=new PostRebository(PostModel)
  private _userModel= new UserRebository(UserModel)
  private _commentModel=new CommentRebository(CommentModel)
  constructor(){}

//======================createComment======================
createComment=async(req:Request,res:Response,next:NextFunction)=>{

  const {postId,commentId}:createCommentValidationParamsType=req.params as createCommentValidationParamsType 
  const {content,attachment,tags,onModel}:createCommentValidationType=req.body as createCommentValidationType

let doc :HydratedDocument<IPost | IComment> | null=null 

//reply to comment
if(onModel == onModelEnum.Comment){
  if(!commentId){
    return next(new appError("comment id is required",400))
  }

const comment =await this._commentModel.findOne({
  _id:commentId,
  refId:postId
},
undefined,
{
  populate:[
    {
    path:"refId",
    match:{
      allowComment:AllowCommentEnum.allow,
      $or:AvailablityPost(req)
    }
  }
]
}
)
if(!comment){
  return next(new appError("comment not found",404))
}
doc=comment
}

//comment on post
else if( onModel == onModelEnum.Post ){
if(commentId){
  return next(new appError("comment id is required",400))
}

  doc=await this._postModel.findOne(
    {
    _id:postId,
    allowComment:AllowCommentEnum.allow,
    $or:AvailablityPost(req)
  },
    undefined,
    {
populte:[
  {path:"postId"}
]
    }
  )
  
  if(!doc){
    return next(new appError("post not found",404))
  }
  
}

if(req?.body?.tags?.length && 
    (await this._userModel.find( {filter:{_id:{$in:req?.body?.tags}} } ) as []).length !== req?.body?.tags?.length //dublicate ids
 ){
  throw new appError("invalid user id",400) 
}

 const assetFolderId= uuidv4()

let arrUrls: string[] = []

if(req?.files){

  const files = req?.files as Express.Multer.File[]
  
  for (const file of files) {
    const {secure_url} = await cloudinary.uploader.upload(file.path, {
      folder: `social-media/users/${doc?.createdBy}/posts/${doc?.assetFolder}/comments/${assetFolderId}`,
    })
    arrUrls.push(secure_url)
  }
}

const comment = await this._commentModel.create({
...req.body,
tags:tags as unknown as Types.ObjectId[],
attachment: arrUrls,
assetFolder:assetFolderId,
refId:doc?._id as unknown as Types.ObjectId,
onModel:onModel,
createdBy: req?.user?._id as unknown as Types.ObjectId,
})
if(!comment){
   await cloudinary.api.delete_resources(arrUrls)
  throw new appError("failed to create comment",400)
}
 
return res.status(201).json({message:"created success",comment})    
}


}

export default new CommentService()