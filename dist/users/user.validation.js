import z from "zod";
import { GenderType } from "../DB/model/user.model.js";
import { Types } from "mongoose";
export var flagType;
(function (flagType) {
    flagType["all"] = "all";
    flagType["current"] = "current";
})(flagType || (flagType = {}));
export const signUpSchema = {
    body: z.object({
        userName: z.string().max(20).min(2),
        email: z.string().email(),
        password: z.string().regex((/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)),
        cPassword: z.string(),
        age: z.number(),
        address: z.string(),
        phone: z.string(),
        gender: z.enum([GenderType.male, GenderType.female]),
    }).required().refine((data) => {
        return data.password === data.cPassword;
    }, { error: "password not match",
        path: ["cPassword"]
    })
};
export const confirmEmailSchema = {
    body: z.object({
        email: z.email(),
        otp: z.string().regex((/^\d{6}$/)).trim(),
    }).required()
};
export const signInSchema = {
    body: z.object({
        email: z.email(),
        password: z.string().regex((/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)),
    }).required()
};
export const logOutSchema = {
    body: z.object({
        flag: z.enum(flagType),
    }).required()
};
export const loginWithGmailSchema = {
    body: z.object({
        idToken: z.string(),
    }).required()
};
export const forgetPasswordSchema = {
    body: z.object({
        email: z.email(),
    }).required()
};
export const resetPasswordSchema = {
    body: z.object({
        email: z.email(),
        otp: z.string().regex((/^\d{6}$/)).trim(),
        password: z.string().regex((/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)),
        cPassword: z.string(),
    }).required().refine((data) => {
        return data.password === data.cPassword;
    }, { error: "password not match",
        path: ["cPassword"]
    })
};
export const freezeAccountSchema = {
    params: z.strictObject({
        userId: z.string(),
    }).required().refine((data) => {
        return data?.userId ? Types.ObjectId.isValid(data.userId) : true;
    }, {
        error: "user id is required",
        path: ["userId"]
    })
};
