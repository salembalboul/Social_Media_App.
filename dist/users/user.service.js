import { flagType } from "./user.validation.js";
import UserModel, { providerType, RoleType } from "../DB/model/user.model.js";
import { UserRebository } from "../DB/rebositories/user.rebos.js";
import { appError } from "../utils/classError.js";
import { Compare, Hash } from "../utils/hash/hash.js";
import { generateToken } from "../utils/token.js";
import { RevokeTokenRebository } from "../DB/rebositories/revokeToken.rebo.js";
import revokeTokenModel from "../DB/model/revokeToken.model.js";
import { v4 as uuidv4 } from 'uuid';
import { OAuth2Client } from 'google-auth-library';
import { generateOtp } from "../service/sendEmail.js";
import eventEmitter from "../service/event.js";
import { createUploadPresignedUrl } from "../utils/s3.config.js";
export class UserService {
    _userModel = new UserRebository(UserModel);
    _revokeTokenModel = new RevokeTokenRebository(revokeTokenModel);
    constructor() { }
    signUp = async (req, res, next) => {
        let { userName, email, password, cPassword, address, age, gender, phone } = req.body;
        if (await this._userModel.findOne({ email })) {
            throw new appError("user already exists", 400);
        }
        const otp = await generateOtp();
        const hash = await Hash(password);
        const hashedOtp = await Hash(String(otp));
        const user = await this._userModel.createOne({ userName, email, otp: hashedOtp, password: hash, address, age, gender, phone });
        eventEmitter.emit("confirmEmail", { email, otp });
        return res.status(201).send({ message: "success", user });
    };
    confirmEmail = async (req, res, next) => {
        const { email, otp } = req.body;
        const user = await this._userModel.findOne({ email, confirmed: { $exists: false } });
        if (!user) {
            throw new appError("invalid email or already confirmed", 400);
        }
        const OTP = user?.otp;
        if (!await Compare(otp, OTP)) {
            throw new appError("invalid otp", 400);
        }
        await this._userModel.updateOne({ email: user?.email }, { confirmed: true, $unset: { otp: "" } });
        return res.status(200).json({ message: "success confirmation" });
    };
    signIn = async (req, res, next) => {
        const { email, password } = req.body;
        const user = await this._userModel.findOne({ email, confirmed: true, provider: providerType.system });
        if (!user) {
            throw new appError("email not found or not confirmed", 404);
        }
        const isMatch = await Compare(password, user?.password);
        if (!isMatch) {
            throw new appError("invalid password", 400);
        }
        const jwtid = uuidv4();
        const access_token = await generateToken({
            payload: { id: user._id, email: user?.email },
            signature: user.role == RoleType.user ? process.env.TOKEN_SIGNATURE : process.env.ADMIN_TOKEN_SIGNATURE,
            options: { expiresIn: "1y", jwtid }
        });
        const refresh_token = await generateToken({
            payload: { id: user._id, email: user?.email },
            signature: user.role == RoleType.user ? process.env.REFRESH_TOKEN_SIGNATURE : process.env.ADMIN_REFRESH_TOKEN_SIGNATURE,
            options: { expiresIn: "1y", jwtid }
        });
        return res.status(200).json({ message: "success", access_token, refresh_token });
    };
    getProfile = async (req, res, next) => {
        const user = req.user;
        return res.status(200).send({ message: "success", user });
    };
    logOut = async (req, res, next) => {
        const { flag } = req.body;
        if (flag === flagType.all) {
            await this._userModel.updateOne({ _id: req.user?._id }, { changeCredentials: new Date() });
            return res.status(400).send({ message: "success,logOut from all devices" });
        }
        await this._revokeTokenModel.create({
            userId: req.user?._id,
            tokenId: req.decoded?.jti,
            expiresAt: new Date(req.decoded?.exp * 1000)
        });
        return res.status(200).send({ message: "success,logOut from this device" });
    };
    refreshToken = async (req, res, next) => {
        const jwtid = uuidv4();
        const access_token = await generateToken({
            payload: { id: req.user?._id, email: req.user?.email },
            signature: req.user?.role == RoleType.user ? process.env.TOKEN_SIGNATURE : process.env.ADMIN_TOKEN_SIGNATURE,
            options: { expiresIn: "1y", jwtid }
        });
        const refresh_token = await generateToken({
            payload: { id: req.user?._id, email: req.user?.email },
            signature: req.user?.role == RoleType.user ? process.env.REFRESH_TOKEN_SIGNATURE : process.env.ADMIN_REFRESH_TOKEN_SIGNATURE,
            options: { expiresIn: "1y", jwtid }
        });
        await this._revokeTokenModel.create({
            userId: req.user?._id,
            tokenId: req.decoded?.jti,
            expiresAt: new Date(req.decoded?.exp * 1000)
        });
        return res.status(200).json({ message: "success", access_token, refresh_token });
    };
    loginWithGmail = async (req, res, next) => {
        const { idToken } = req.body;
        const client = new OAuth2Client();
        async function verify() {
            const ticket = await client.verifyIdToken({
                idToken,
                audience: process.env.WEB_CLIENT_ID,
            });
            const payload = ticket.getPayload();
            return payload;
        }
        const { email, email_verified, name, picture } = await verify();
        if (!email) {
            throw new appError("Email not provided by Google", 400);
        }
        let user = await this._userModel.findOne({ email });
        if (!user) {
            user = await this._userModel.createOne({
                email: email,
                image: picture,
                userName: name,
                confirmed: email_verified,
                provider: providerType.google
            });
        }
        if (user?.provider === providerType.system) {
            throw new appError("please log in with system", 404);
        }
        const jwtid = uuidv4();
        const access_token = await generateToken({
            payload: { id: user?._id, email: user?.email },
            signature: user?.role == RoleType.user ? process.env.TOKEN_SIGNATURE : process.env.ADMIN_TOKEN_SIGNATURE,
            options: { expiresIn: "1y", jwtid }
        });
        const refresh_token = await generateToken({
            payload: { id: user?._id, email: user?.email },
            signature: user?.role == RoleType.user ? process.env.REFRESH_TOKEN_SIGNATURE : process.env.ADMIN_REFRESH_TOKEN_SIGNATURE,
            options: { expiresIn: "1y", jwtid }
        });
        return res.status(200).json({ message: "success", access_token, refresh_token });
    };
    forgetPassword = async (req, res, next) => {
        const { email } = req.body;
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
    resetPassword = async (req, res, next) => {
        const { email, otp, password, cPassword } = req.body;
        const user = await this._userModel.findOne({ email, otp: { $exists: true } });
        if (!user) {
            throw new appError("user not found or otp not found", 404);
        }
        if (!await Compare(otp, user?.otp)) {
            throw new appError("invalid otp", 400);
        }
        const hash = await Hash(password);
        await this._userModel.updateOne({ email }, { password: hash, $unset: { otp: "" } });
        return res.status(200).json({ message: "success reset password", user });
    };
    uploadImage = async (req, res, next) => {
        const { originalname, contentType } = req.body;
        const url = await createUploadPresignedUrl({
            originalname,
            contentType,
            path: `users/${req.user?._id}`
        });
        return res.status(200).send({ message: "success", url });
    };
}
export default new UserService();
