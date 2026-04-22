import z from "zod";
import { GenderType } from "../../DB/model/user.model.js";
import { Types } from "mongoose";
import { generalRules } from "../../utils/generalRules.js";

export enum flagType {
  all = "all",
  current = "current",
}

export const signUpSchema = {
  body: z
    .object({
      userName: z.string().max(20).min(2),
      email: generalRules.email,
      password: generalRules.password,
      cPassword: z.string(),
      age: z.string(),
      address: z.string(),
      phone: z.string(),
      gender: z.enum([GenderType.male, GenderType.female]),
    })
    .required()
    .refine(
      (data) => {
        return data.password === data.cPassword;
      },
      { error: "password not match", path: ["cPassword"] },
    ),
};

export const confirmEmailSchema = {
  body: z
    .object({
      email: generalRules.email,
      otp: generalRules.otp,
    })
    .required(),
};

export const signInSchema = {
  body: z
    .object({
      email: generalRules.email,
      password: generalRules.password,
    })
    .required(),
};

export const logOutSchema = {
  body: z
    .object({
      flag: z.enum(flagType),
    })
    .required(),
};

export const loginWithGmailSchema = {
  body: z
    .object({
      idToken: z.string(),
    })
    .required(),
};

export const forgetPasswordSchema = {
  body: z
    .object({
      email: generalRules.email,
    })
    .required(),
};

export const resetPasswordSchema = {
  body: z
    .object({
      email: generalRules.email,
      otp: z
        .string()
        .regex(/^\d{6}$/)
        .trim(),
      password: generalRules.password,
      cPassword: z.string(),
    })
    .required()
    .refine(
      (data) => {
        return data.password === data.cPassword;
      },
      { error: "password not match", path: ["cPassword"] },
    ),
};
export const freezeAccountSchema = {
  params: z
    .strictObject({
      userId: z.string(),
    })
    .required()
    .refine(
      (data) => {
        return data?.userId ? Types.ObjectId.isValid(data.userId) : true;
      },
      {
        error: "user id is required",
        path: ["userId"],
      },
    ),
};
export const updateProfileImageSchema = {
  file: generalRules.fileSchema,
};
export const updateRoleSchema = {
  params: z
    .strictObject({
      userId: z.string(),
    })
    .required()
    .refine(
      (data) => {
        return data?.userId ? Types.ObjectId.isValid(data.userId) : true;
      },
      {
        error: "user id is required",
        path: ["userId"],
      },
    ),
};
export const sendRequestSchema = {
  params: z
    .strictObject({
      sendTo: z.string(),
    })
    .required()
    .refine(
      (data) => {
        return data?.sendTo ? Types.ObjectId.isValid(data.sendTo) : true;
      },
      {
        error: "user id is required",
        path: ["sendTo"],
      },
    ),
};

export const acceptRequestSchema = {
  params: z
    .strictObject({
      requestId: z.string(),
    })
    .required()
    .refine(
      (data) => {
        return data?.requestId ? Types.ObjectId.isValid(data.requestId) : true;
      },
      {
        error: "user id is required",
        path: ["requestId"],
      },
    ),
};

export const getUserSchema = z
  .strictObject({
    id: generalRules.id,
  })
  .required();

export type signUpSchemaType = z.infer<typeof signUpSchema.body>;
export type confirmEmailSchemaType = z.infer<typeof confirmEmailSchema.body>;
export type signInSchemaType = z.infer<typeof signInSchema.body>;
export type logOutSchemaType = z.infer<typeof logOutSchema.body>;
export type loginWithGmailSchemaType = z.infer<
  typeof loginWithGmailSchema.body
>;
export type forgetPasswordSchemaType = z.infer<
  typeof forgetPasswordSchema.body
>;
export type resetPasswordSchemaType = z.infer<typeof resetPasswordSchema.body>;
export type freezeAccountSchemaType = z.infer<
  typeof freezeAccountSchema.params
>;
export type updateProfileImageSchemaType = z.infer<
  typeof updateProfileImageSchema.file
>;
export type updateRoleSchemaType = z.infer<typeof updateRoleSchema.params>;
export type sendRequestSchemaType = z.infer<typeof sendRequestSchema.params>;
export type acceptRequestSchemaType = z.infer<
  typeof acceptRequestSchema.params
>;
