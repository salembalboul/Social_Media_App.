import {Router} from "express";
const userRouter = Router()
import US from "./user.service.js"
import { confirmEmailSchema, forgetPasswordSchema, loginWithGmailSchema, logOutSchema, resetPasswordSchema, signInSchema, signUpSchema } from "./user.validation.js";
import { Validation } from "../middleware/validation.js";
import { authentication } from "../middleware/authentication.js";
import { TokenType } from "../utils/token.js";
import { fileValidation, multerCloud, storeTypeEnum } from "../middleware/multer.cloud.js";

userRouter.post("/signUp",Validation(signUpSchema),US.signUp)
userRouter.patch("/confirmEmail",Validation(confirmEmailSchema),US.confirmEmail)
userRouter.post("/signIn",Validation(signInSchema),US.signIn)
userRouter.get("/profile",authentication(),US.getProfile)
userRouter.post("/logOut",authentication(),Validation(logOutSchema),US.logOut)
userRouter.get("/refreshToken",authentication(TokenType.refresh),US.refreshToken)
userRouter.post("/loginWithGmail",Validation(loginWithGmailSchema),US.loginWithGmail)
userRouter.patch("/forgetPassword",Validation(forgetPasswordSchema),US.forgetPassword)
userRouter.patch("/resetPassword",Validation(resetPasswordSchema),US.resetPassword)
userRouter.post("/uploadImage",authentication(),
//multerCloud({fileTypes:fileValidation.image,storeTypes:storeTypeEnum.disk}).array("files"),
US.uploadImage)

export default userRouter