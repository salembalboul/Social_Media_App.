import { Router } from "express";
const userRouter = Router();
import US from "./user.service.js";
import {
  acceptRequestSchema,
  confirmEmailSchema,
  forgetPasswordSchema,
  freezeAccountSchema,
  loginWithGmailSchema,
  logOutSchema,
  resetPasswordSchema,
  sendRequestSchema,
  signInSchema,
  signUpSchema,
  updateProfileImageSchema,
} from "./user.validation.js";
import { Validation } from "../../middleware/validation.js";
import { authentication } from "../../middleware/authentication.js";
import { TokenType } from "../../utils/token.js";
import { authorization } from "../../middleware/authorization.js";
import { RoleType } from "../../DB/model/user.model.js";
import { fileValidation, MulterHost } from "../../middleware/multer.cloud.js";
import chatRouter from "../chat/chat.controller.js";

userRouter.use("/:userId/chat", chatRouter);
userRouter.post(
  "/signUp",
  MulterHost({ customExtensions: [...fileValidation.image] }).fields([
    { name: "profileImage", maxCount: 1 },
    { name: "coverImages", maxCount: 2 },
  ]),
  Validation(signUpSchema),
  US.signUp,
);

userRouter.patch(
  "/updateProfileImage",
  authentication(),
  MulterHost({ customExtensions: [...fileValidation.image] }).single(
    "profileImage",
  ),
  Validation(updateProfileImageSchema),
  US.updateProfileImage,
);
userRouter.patch(
  "/confirmEmail",
  Validation(confirmEmailSchema),
  US.confirmEmail,
);
userRouter.post("/signIn", Validation(signInSchema), US.signIn);
userRouter.get("/profile", authentication(), US.getProfile);
userRouter.post(
  "/logOut",
  authentication(),
  Validation(logOutSchema),
  US.logOut,
);
userRouter.get(
  "/refreshToken",
  authentication(TokenType.refresh),
  US.refreshToken,
);
userRouter.post(
  "/loginWithGmail",
  Validation(loginWithGmailSchema),
  US.loginWithGmail,
);
userRouter.patch(
  "/forgetPassword",
  Validation(forgetPasswordSchema),
  US.forgetPassword,
);
userRouter.patch(
  "/resetPassword",
  Validation(resetPasswordSchema),
  US.resetPassword,
);
// userRouter.post("/uploadImage",authentication(),
// //multerCloud({fileTypes:fileValidation.image,storeTypes:storeTypeEnum.disk}).array("files"),
// US.uploadImage)
userRouter.patch(
  "/freezeAccount/{:userId}",
  authentication(TokenType.access),
  Validation(freezeAccountSchema),
  US.freezeAccount,
);
userRouter.patch(
  "/restoreAccount/:userId",
  authentication(TokenType.access),
  authorization({ accessRoles: [RoleType.admin, RoleType.superAdmin] }),
  US.restoreAccount,
);
userRouter.get(
  "/dashBoard",
  authentication(),
  authorization({ accessRoles: [RoleType.admin, RoleType.superAdmin] }),
  US.dashBoard,
);
userRouter.patch(
  "/updateRole/:userId",
  authentication(),
  authorization({ accessRoles: [RoleType.admin, RoleType.superAdmin] }),
  US.updateRole,
);
userRouter.patch(
  "/sendRequest/:sendTo",
  authentication(),
  Validation(sendRequestSchema),
  US.sendRequest,
);
userRouter.patch(
  "/acceptRequest/:requestId",
  authentication(),
  Validation(acceptRequestSchema),
  US.acceptRequest,
);

export default userRouter;
