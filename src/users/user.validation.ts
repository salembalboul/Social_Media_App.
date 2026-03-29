import z from "zod";
import { GenderType } from "../DB/model/user.model.js";

export enum flagType{
  all ="all",
  current="current"
}

export const signUpSchema={
    body:z.object({
        userName:z.string().max(20).min(2),
        email:z.string().email(),
        password:z.string().regex((/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)),
        cPassword:z.string(),
        age:z.number(),
        address:z.string(),
        phone:z.string(),
        gender:z.enum([GenderType.male,GenderType.female]),
    }).required().refine((data)=>{
        return data.password===data.cPassword},
        {   error:"password not match",
            path:["cPassword"]
        }
    )
}

export const confirmEmailSchema={
    body:z.object({
        email:z.email(),
        otp:z.string().regex((/^\d{6}$/)).trim(),
    }).required()
}

export const signInSchema={
    body:z.object({
        email:z.email(),
        password:z.string().regex((/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)),
    }).required()
}

export const logOutSchema={
    body:z.object({
        flag:z.enum(flagType),
    }).required()
}

export const loginWithGmailSchema={
    body:z.object({
        idToken:z.string(),
    }).required()
}

export const forgetPasswordSchema={
    body:z.object({
        email:z.email(),
    }).required()
}

export const resetPasswordSchema={
    body:z.object({
        email:z.email(),
        otp:z.string().regex((/^\d{6}$/)).trim(),
        password:z.string().regex((/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)),
        cPassword:z.string(),
    }).required().refine((data)=>{
        return data.password===data.cPassword},
        {   error:"password not match",
            path:["cPassword"]
        }
    )
}

export type signUpSchemaType= z.infer<typeof signUpSchema.body> 
export type confirmEmailSchemaType =z.infer<typeof confirmEmailSchema.body>
export type signInSchemaType =z.infer<typeof signInSchema.body>
export type logOutSchemaType =z.infer<typeof logOutSchema.body>
export type loginWithGmailSchemaType =z.infer<typeof loginWithGmailSchema.body>
export type forgetPasswordSchemaType =z.infer<typeof forgetPasswordSchema.body>
export type resetPasswordSchemaType =z.infer<typeof resetPasswordSchema.body>
