import { Request, Response, NextFunction } from "express";
import {
  acceptRequestSchemaType,
  confirmEmailSchemaType,
  flagType,
  forgetPasswordSchemaType,
  freezeAccountSchemaType,
  getUserSchema,
  loginWithGmailSchemaType,
  logOutSchemaType,
  resetPasswordSchemaType,
  sendRequestSchemaType,
  signInSchemaType,
  signUpSchemaType,
  updateRoleSchemaType,
} from "./user.validation.js";
import UserModel, {
  IUser,
  providerType,
  RoleType,
} from "../../DB/model/user.model.js";
import { UserRebository } from "../../DB/rebositories/user.rebos.js";
import { appError } from "../../utils/classError.js";
import { Compare, Hash } from "../../utils/hash/hash.js";
import { generateToken, TokenType } from "../../utils/token.js";
import { RevokeTokenRebository } from "../../DB/rebositories/revokeToken.rebo.js";
import revokeTokenModel from "../../DB/model/revokeToken.model.js";
import { v4 as uuidv4 } from "uuid";
import { OAuth2Client, TokenPayload } from "google-auth-library";
import { HydratedDocument, Types } from "mongoose";
import { generateOtp } from "../../service/sendEmail.js";
import eventEmitter from "../../service/event.js";
import cloudinary from "../../utils/cloudinary/index.js";
import PostModel from "../../DB/model/post.model.js";
import { PostRebository } from "../../DB/rebositories/post.repo.js";
import { FriendRequestRebository } from "../../DB/rebositories/friendRequest.repo.js";
import FriendRequestModel from "../../DB/model/friendRequest.model.js";
import ChatModel from "../../DB/model/chat.model.js";
import { ChatRebository } from "../../DB/rebositories/chat.repo.js";
import { ValidationGQL } from "../../middleware/validation.js";
import { GraphQLError } from "graphql";

export class UserService {
  private _userModel = new UserRebository(UserModel);
  private _revokeTokenModel = new RevokeTokenRebository(revokeTokenModel);
  private _postModel = new PostRebository(PostModel);
  private _requestModel = new FriendRequestRebository(FriendRequestModel);
  private _chatModel = new ChatRebository(ChatModel);

  constructor() {}

  //======================signUp======================
  signUp = async (req: Request, res: Response, next: NextFunction) => {
    let {
      userName,
      email,
      password,
      address,
      age,
      gender,
      phone,
    }: signUpSchemaType = req.body as signUpSchemaType;

    if (await this._userModel.findOne({ email })) {
      throw new appError("user already exists", 400);
    }

    const otp = await generateOtp();
    const hash = await Hash(password);
    const hashedOtp = await Hash(String(otp));

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    const coverImages = files.coverImages;
    if (!coverImages) {
      throw new appError("cover images not found", 400);
    }

    let arrPaths: { secure_url: string; public_id: string }[] = [];

    for (const file of coverImages as Express.Multer.File[]) {
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        file.path,
        {
          folder: "social-media/users/coverImages",
        },
      );

      arrPaths.push({ secure_url, public_id });
    }
    if (!files?.profileImage?.[0]?.path) {
      throw new appError("Profile image file path not found", 400);
    }
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      files?.profileImage[0]?.path,
      {
        folder: "social-media/users/profileImages",
      },
    );

    const user = await this._userModel.createOne({
      userName,
      email,
      otp: hashedOtp,
      password: hash,
      address,
      age: age as unknown as number,
      gender,
      friends: [],
      phone,
      profileImage: { secure_url, public_id },
      coverImages: arrPaths,
    });

    eventEmitter.emit("confirmEmail", { email, otp });

    return res.status(201).send({ message: "success", user });
  };

  //======================confirmEmail======================
  confirmEmail = async (req: Request, res: Response, next: NextFunction) => {
    const { email, otp }: confirmEmailSchemaType = req.body;

    const user = await this._userModel.findOne({
      email,
      confirmed: { $exists: false },
    });
    if (!user) {
      throw new appError("invalid email or already confirmed", 400);
    }
    const OTP = user?.otp!;

    if (!(await Compare(otp, OTP))) {
      throw new appError("invalid otp", 400);
    }

    await this._userModel.updateOne(
      { email: user?.email },
      { confirmed: true, $unset: { otp: "" } },
    );

    return res.status(200).json({ message: "success confirmation" });
  };

  //======================signIn======================
  signIn = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password }: signInSchemaType = req.body;

    const user = await this._userModel.findOne({
      email,
      confirmed: true,
      provider: providerType.system,
    });

    if (!user) {
      throw new appError("email not found or not confirmed", 404);
    }

    const isMatch = await Compare(password, user?.password!);

    if (!isMatch) {
      throw new appError("invalid password", 400);
    }

    const jwtid = uuidv4();
    ////////create token///////
    const access_token = await generateToken({
      payload: { id: user._id, email: user?.email! },
      signature:
        user.role == RoleType.user
          ? process.env.TOKEN_SIGNATURE!
          : process.env.ADMIN_TOKEN_SIGNATURE!,
      options: { expiresIn: "1y", jwtid },
    });

    const refresh_token = await generateToken({
      payload: { id: user._id, email: user?.email! },
      signature:
        user.role == RoleType.user
          ? process.env.REFRESH_TOKEN_SIGNATURE!
          : process.env.ADMIN_REFRESH_TOKEN_SIGNATURE!,
      options: { expiresIn: "1y", jwtid },
    });

    return res
      .status(200)
      .json({ message: "done", access_token, refresh_token });
  };

  //======================getProfile======================
  getProfile = async (req: Request, res: Response, next: NextFunction) => {
    const user = await this._userModel.findOne(
      { _id: req?.user?._id! },
      undefined,
      {
        populate: {
          path: "friends",
        },
      },
    );

    if (!user) {
      return next(new appError("User not found", 404));
    }
    const groups = await this._chatModel.find({
      filter: {
        participants: { $in: [req?.user?._id!] },
        group: { $exists: true },
      },
    });

    return res.status(200).send({ message: "success", user, groups });
  };

  //======================logOut======================
  logOut = async (req: Request, res: Response, next: NextFunction) => {
    const { flag }: logOutSchemaType = req.body;

    if (flag === flagType.all) {
      await this._userModel.updateOne(
        { _id: req.user?._id! },
        { changeCredentials: new Date() },
      );

      return res
        .status(400)
        .send({ message: "success,logOut from all devices" });
    }

    await this._revokeTokenModel.create({
      userId: req.user?._id!,
      tokenId: req.decoded?.jti!,
      expiresAt: new Date(req.decoded?.exp! * 1000),
    });

    return res.status(200).send({ message: "success,logOut from this device" });
  };

  //======================refreshToken======================
  refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    const jwtid = uuidv4();
    ////////create token///////
    const access_token = await generateToken({
      payload: { id: req.user?._id!, email: req.user?.email! },
      signature:
        req.user?.role == RoleType.user
          ? process.env.TOKEN_SIGNATURE!
          : process.env.ADMIN_TOKEN_SIGNATURE!,
      options: { expiresIn: "1y", jwtid },
    });

    const refresh_token = await generateToken({
      payload: { id: req.user?._id!, email: req.user?.email! },
      signature:
        req.user?.role == RoleType.user
          ? process.env.REFRESH_TOKEN_SIGNATURE!
          : process.env.ADMIN_REFRESH_TOKEN_SIGNATURE!,
      options: { expiresIn: "1y", jwtid },
    });

    await this._revokeTokenModel.create({
      userId: req.user?._id!,
      tokenId: req.decoded?.jti!,
      expiresAt: new Date(req.decoded?.exp! * 1000),
    });

    return res
      .status(200)
      .json({ message: "success", access_token, refresh_token });
  };

  //======================loginWithGmail======================
  loginWithGmail = async (req: Request, res: Response, next: NextFunction) => {
    const { idToken }: loginWithGmailSchemaType = req.body;

    const client = new OAuth2Client();
    async function verify() {
      const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.WEB_CLIENT_ID!,
      });
      const payload = ticket.getPayload();
      return payload;
    }

    const { email, email_verified, name, picture } =
      (await verify()) as TokenPayload;

    if (!email) {
      throw new appError("Email not provided by Google", 400);
    }

    let user = await this._userModel.findOne({ email });

    if (!user) {
      user = (await this._userModel.createOne({
        email: email!,
        image: picture!,
        userName: name!,
        confirmed: email_verified!,
        provider: providerType.google,
      })) as HydratedDocument<IUser>;
    }
    if (user?.provider === providerType.system) {
      throw new appError("please log in with system", 404);
    }

    const jwtid = uuidv4();
    ////////create token///////
    const access_token = await generateToken({
      payload: { id: user?._id!, email: user?.email! },
      signature:
        user?.role == RoleType.user
          ? process.env.TOKEN_SIGNATURE!
          : process.env.ADMIN_TOKEN_SIGNATURE!,
      options: { expiresIn: "1y", jwtid },
    });

    const refresh_token = await generateToken({
      payload: { id: user?._id!, email: user?.email! },
      signature:
        user?.role == RoleType.user
          ? process.env.REFRESH_TOKEN_SIGNATURE!
          : process.env.ADMIN_REFRESH_TOKEN_SIGNATURE!,
      options: { expiresIn: "1y", jwtid },
    });

    return res
      .status(200)
      .json({ message: "success", access_token, refresh_token });
  };

  //======================forgetPassword======================
  forgetPassword = async (req: Request, res: Response, next: NextFunction) => {
    const { email }: forgetPasswordSchemaType = req.body;

    const user = await this._userModel.findOne({ email, confirmed: true });
    if (!user) {
      throw new appError("email not found or not confirmed", 404);
    }

    const otp = await generateOtp();
    const hashedOtp = await Hash(String(otp));

    eventEmitter.emit("forgetPassword", { email, otp });

    await this._userModel.updateOne({ email }, { otp: hashedOtp });

    return res.status(200).json({ message: "success send otp" });
  };

  //======================resetPassword======================
  resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    const { email, otp, password, cPassword }: resetPasswordSchemaType =
      req.body;

    const user = await this._userModel.findOne({
      email,
      otp: { $exists: true },
    });
    if (!user) {
      throw new appError("user not found or otp not found", 404);
    }

    if (!(await Compare(otp, user?.otp!))) {
      throw new appError("invalid otp", 400);
    }

    const hash = await Hash(password);

    await this._userModel.updateOne(
      { email },
      { password: hash, $unset: { otp: "" } },
    );

    return res.status(200).json({ message: "success reset password", user });
  };

  //======================uploadImage======================
  // uploadImage=async(req:Request,res:Response,next:NextFunction)=>{

  //   // const key = await uploadFiles({
  //   //   files: req.files as Express.Multer.File[],
  //   //   path: `users/${req.user?._id}`,
  //   //   storeType: storeTypeEnum.disk
  //   // });
  //   const {originalname, contentType} = req.body
  //     const {url,Key} = await createUploadPresignedUrl({
  //     originalname,
  //     contentType,
  //     path: `users/${req.user?._id}`
  //   })

  //   const user =await this._userModel.findOneAndUpdate(
  //     { _id:req.user?._id! } ,
  //     { profileImage:Key ,
  //       tempProfileImage:req.user?.profileImage
  //     } )

  //     if(!user){ throw new appError("user not found",404) }

  // eventEmitter.emit("uploadProfileImage", {userId : req.user?._id!, oldKey:req.user?.profileImage ,Key,expiresIn:60})

  //     return res.status(200).send({message:"success",user,url})

  // }

  //======================freezeAccount======================

  freezeAccount = async (req: Request, res: Response, next: NextFunction) => {
    const { userId }: freezeAccountSchemaType =
      req.params as unknown as freezeAccountSchemaType;

    if (userId && req.user?.role !== RoleType.admin) {
      throw new appError("unauthorized", 401);
    }

    const user = await this._userModel.findOneAndUpdate(
      { _id: userId || req.user?._id!, deletedAt: { $exists: false } },
      {
        deletedAt: new Date(),
        deletedBy: req.user?._id,
        changeCredentials: new Date(),
      },
    );

    if (!user) {
      throw new appError("user is not found", 404);
    }

    return res.status(200).send({ message: "success freeze account" });
  };

  //======================restoreAccount======================
  restoreAccount = async (req: Request, res: Response, next: NextFunction) => {
    const { userId }: freezeAccountSchemaType =
      req.params as unknown as freezeAccountSchemaType;

    const user = await this._userModel.findOneAndUpdate(
      {
        _id: userId!,
        deletedAt: { $exists: true, $ne: null, $type: "date" },
        $and: [{ deletedBy: { $ne: userId } }, { deletedBy: { $ne: null } }],
      },
      {
        $unset: { deletedAt: "", deletedBy: "" },
        $set: {
          restoredAt: new Date(),
          restoredBy: req.user?._id!,
          changeCredentials: new Date(),
        },
      },
      { new: true },
    );

    if (!user) {
      throw new appError(
        "user not found or not deleted or deleted by you",
        404,
      );
    }

    return res.status(200).send({ message: "success restore account", user });
  };

  //======================updateProfile======================
  updateProfileImage = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const attachment = req.file as Express.Multer.File;

    if (!attachment) {
      throw new appError("attachment not found", 400);
    }
    const userId = await this._userModel.findOne(req?.user?._id!);

    const { secure_url, public_id } = await cloudinary.uploader.upload(
      attachment.path,
      {
        folder: `social-media/users/${userId?._id}/profileImages`,
      },
    );

    const user = await this._userModel.findOneAndUpdate(
      { _id: req.user?._id! },
      { profileImage: { secure_url, public_id } },
      { new: false },
    );

    //  await cloudinary.uploader.destroy(user?.profileImage?.public_id as string)
    if (user?.profileImage?.public_id) {
      await cloudinary.api.delete_resources([
        user?.profileImage?.public_id as string,
      ]);
    }

    if (!user) {
      throw new appError("user not found", 404);
    }

    return res.status(200).send({ message: "success", user });
  };
  //======================dashBoard======================
  dashBoard = async (req: Request, res: Response, next: NextFunction) => {
    const result = await Promise.allSettled([
      this._userModel.find({ filter: {} }),
      this._postModel.find({ filter: {} }),
    ]);

    return res.status(200).json({
      message: "success",
      result: {
        users: result[0],
        posts: result[1],
      },
    });
  };

  //======================updateRole======================
  updateRole = async (req: Request, res: Response, next: NextFunction) => {
    const { userId }: updateRoleSchemaType = req.params as updateRoleSchemaType;
    const { role } = req.body;

    const user = await this._userModel.findById(userId);

    if (!user) {
      throw new appError("user not found", 404);
    }

    const roleType = { user: 1, admin: 2, superAdmin: 3 };

    const tokenUserRole = roleType[req?.user?.role as keyof typeof roleType];
    const userRole = roleType[user?.role as keyof typeof roleType];
    const newRoleValue = roleType[role as keyof typeof roleType];

    if (!newRoleValue) {
      throw new appError("invalid role", 400);
    }

    if (tokenUserRole <= userRole) {
      throw new appError("role can only update to lower role", 401);
    }

    if (tokenUserRole <= newRoleValue) {
      throw new appError("role can only update to lower role", 401);
    }

    let updatedUser = await this._userModel.findOneAndUpdate(
      { _id: userId },
      { role },
      { new: true },
    );

    return res.status(200).send({ message: "success", updatedUser });
  };

  //======================sendRequest======================
  sendRequest = async (req: Request, res: Response, next: NextFunction) => {
    const { sendTo }: sendRequestSchemaType =
      req.params as sendRequestSchemaType;

    const user = await this._userModel.findById(sendTo);
    if (!user) {
      throw new appError("user not found", 404);
    }
    if (req?.user?._id.toString() === sendTo) {
      throw new appError("you can't send request to yourself", 400);
    }
    const sendToId = new Types.ObjectId(sendTo);

    const checkRequest = await this._requestModel.findOne({
      createdBy: { $in: [req.user?._id!, sendToId] },
      sendTo: { $in: [req.user?._id!, sendToId] },
      acceptedAt: { $exists: false },
    });

    if (checkRequest) {
      throw new appError("request already sent", 400);
    }

    const createRequest = await this._requestModel.create({
      createdBy: req.user?._id!,
      sendTo: sendToId,
    });

    return res.status(200).send({ message: "success", createRequest });
  };
  //======================acceptRequest======================
  acceptRequest = async (req: Request, res: Response, next: NextFunction) => {
    const { requestId }: acceptRequestSchemaType =
      req.params as acceptRequestSchemaType;

    const checkRequest = await this._requestModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(requestId),
        sendTo: new Types.ObjectId(req.user?._id!),
        acceptedAt: { $exists: false },
      },
      {
        acceptedAt: new Date(),
      },
      { new: true },
    );

    if (!checkRequest) {
      throw new appError("request not found", 404);
    }

    await Promise.all([
      this._userModel.updateOne(
        {
          _id: new Types.ObjectId(checkRequest.createdBy as unknown as string),
        },
        {
          $push: {
            friends: new Types.ObjectId(
              checkRequest.sendTo as unknown as string,
            ),
          },
        },
      ),

      this._userModel.updateOne(
        { _id: new Types.ObjectId(checkRequest.sendTo as unknown as string) },
        {
          $push: {
            friends: new Types.ObjectId(
              checkRequest.createdBy as unknown as string,
            ),
          },
        },
      ),
    ]);

    return res.status(200).send({ message: "success" });
  };

  //=====================graphql=======================
  //====getUser====
  getUser = async (parent: any, args: { id: string }, context: any) => {
    // const { user } = (await authenticationGQL(
    //   context.req.headers.authorization,
    //   TokenType.access,
    // )) as { user: IUser };

    // await authorizationGQL({
    //   role: user?.role!,
    //   accessRoles: [RoleType.admin, RoleType.superAdmin],
    // });

    await ValidationGQL<typeof args>(getUserSchema, args);

    const userExist = await this._userModel.findOne({
      _id: Types.ObjectId.createFromHexString(args.id),
    });
    if (!userExist) {
      return new GraphQLError("user not found", {
        extensions: {
          code: "USER_NOT_FOUND",
          status: 404,
        },
      });
    }
    return userExist;
  };

  //====getUser=====
  getusers = async (parent: any, args: any) => {
    const users = await this._userModel.find({ filter: {} });
    return users;
  };

  //=====addUser======
  adduser = async (parent: any, args: any) => {
    const { fName, lName, email, password, gender, age } = args;
    const emailExist = await this._userModel.findOne({ email });
    if (emailExist) {
      throw new appError("email already exists", 400);
    }
    const hashPassword = await Hash(password);

    const user = await this._userModel.create({
      fName,
      lName,
      email,
      password: hashPassword,
      gender,
      age,
    });
    return user;
  };
}

export default new UserService();
