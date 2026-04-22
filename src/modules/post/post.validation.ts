import z from "zod";
import { AllowCommentEnum, AvailablityEnum } from "../../DB/model/post.model.js";
import { generalRules } from "../../utils/generalRules.js";

export enum LikeActionEnum {
    like = "like",
    unlike = "unlike"
}

export const createPostValidation={
    body:z.strictObject({
        content:z.string().min(5).max(100000).optional(),
        assetFolder:z.string().optional(),
        attachment :z.array(generalRules.fileSchema).max(2).optional(),
        
        allowComment:z.enum(AllowCommentEnum).default(AllowCommentEnum.allow).optional(),
        availablity:z.enum(AvailablityEnum).default(AvailablityEnum.public).optional(),

        tags:z.array(generalRules.id).refine( (data) => { 
            return new Set(data).size === data.length } , 
            { message:"dublicate user id"}).optional()
    }).superRefine((data,ctx)=>{
        if(!data?.attachment?.length && !data?.content){
            ctx.addIssue({
                code:"custom",
                path:["content"],
                message:"content or attachment is required"
            })
        }
    })
}

export const likePostValidation={
    params:z.strictObject({
        postId:generalRules.id
    }),
    query:z.strictObject({
        action:z.enum(LikeActionEnum).optional()
    })
}

export const updatePostValidation={
    body:z.strictObject({
        content:z.string().min(5).max(100000).optional(),
        assetFolder:z.string().optional(),
        attachment :z.array(generalRules.fileSchema).max(2).optional(),
        
        allowComment:z.enum(AllowCommentEnum).default(AllowCommentEnum.allow).optional(),
        availablity:z.enum(AvailablityEnum).default(AvailablityEnum.public).optional(),

        tags:z.array(generalRules.id).refine( (data) => { return new Set(data).size === data.length } , 
            { message:"dublicate user id"}).optional()
    }).superRefine((data,ctx)=>{
        if(!Object.values(data).length){
            ctx.addIssue({
                code:"custom",
                path:["content"],
                message:"at least one field is required"
            })
        }
    })
}
export const getPostValidation={
    params:z.strictObject({
        postId:generalRules.id
    })
}
export type createPostValidationType= z.infer<typeof createPostValidation.body>
export type likePostValidationType= z.infer<typeof likePostValidation.params>
export type likePostQueryType= z.infer<typeof likePostValidation.query>
export type updatePostValidationType= z.infer<typeof updatePostValidation.body>
export type getPostValidationType= z.infer<typeof getPostValidation.params>