import z from "zod"
import { Types } from "mongoose"
import { generalRules } from "../../utils/generalRules.js"

export const getChatValidation = {
        params:z.strictObject({
            userId:z.string(),
        }).required().refine((data)=>{
            return data?.userId ? Types.ObjectId.isValid(data.userId) : true
        },
        {
            error:"user id is required",
            path:["userId"]
        })   
}
// export const sendMessageValidation = {
//     body:z.strictObject({
//         content:z.string().refine((data)=> { return data.trim().length>0 } , { message:"content is required" }),
//         sendTo:generalRules.id,
//     }).required()
// }



export const createGroupValidation = {
    body:z.strictObject({
        group:z.string().min(1),
        participants:z.array(generalRules.id).refine((data)=>{ 
            return new Set(data).size === data.length;
        }, { message:"participants must be unique" }),
        attachment:generalRules.fileSchema.optional(),
    })}
export type createGroupValidationType = z.infer<typeof createGroupValidation.body>

export type getChatValidationType = z.infer<typeof getChatValidation.params>
    // export type sendMessageValidationType = z.infer<typeof sendMessageValidation.body>
