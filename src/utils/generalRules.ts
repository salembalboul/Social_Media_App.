import mongoose from "mongoose"
import z from "zod"

export const generalRules={
 
id:z.string().refine((value)=>
    {
        return mongoose.Types.ObjectId.isValid(value)
    },
    { message:"invalid user id"} ), 
email:z.email(),

password:z.string().regex((/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)),

otp:z.string().regex((/^[0-9]{6}$/)).trim(),

fileSchema: z.union([
  z.object({
    fieldname: z.string(),
    originalname: z.string(),
    encoding: z.string(),
    mimetype: z.string(),
    size: z.number(),
    buffer: z.instanceof(Buffer)
  }),
  z.object({
    fieldname: z.string(),
    originalname: z.string(),
    encoding: z.string(),
    filename: z.string(),
    destination: z.string(),
    mimetype: z.string(),
    size: z.number(),
    path: z.string()
  })
])

}