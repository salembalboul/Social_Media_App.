import z from "zod";
import { AllowCommentEnum, AvailablityEnum } from "../../DB/model/post.model.js";
import { generalRules } from "../../utils/generalRules.js";
import { onModelEnum } from "../../DB/model/comment.model.js";

export enum LikeActionEnum {
    like = "like",
    unlike = "unlike"
}

export const createCommentValidation={
    params:z.strictObject({
        postId:generalRules.id,
        commentId:generalRules.id.optional()
    }),
    body:z.strictObject({
        content:z.string().min(5).max(100000).optional(),
        attachment :z.array(generalRules.fileSchema).max(2).optional(),
        tags:z.array(generalRules.id).refine( (data) => { return new Set(data).size === data.length } , 
            { message:"dublicate user id"}).optional(),
        onModel:z.enum(onModelEnum)
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

export type createCommentValidationType= z.infer<typeof createCommentValidation.body>
export type createCommentValidationParamsType= z.infer<typeof createCommentValidation.params>
