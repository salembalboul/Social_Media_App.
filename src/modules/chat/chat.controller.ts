import { Router } from "express";
import { ChatService } from "./chat.service.js";
import { authentication } from "../../middleware/authentication.js";
import { Validation } from "../../middleware/validation.js";
import { getChatValidation , createGroupValidation } from "./chat.validation.js";
import { fileValidation, MulterHost } from "../../middleware/multer.cloud.js";

const CS=new ChatService()
const chatRouter = Router({mergeParams:true})

chatRouter.get("/",authentication(),Validation(getChatValidation),CS.getChat)
chatRouter.post("/createGroup",
    authentication(),
    MulterHost({customExtensions:fileValidation.image}).single("groupImage"),
    Validation(createGroupValidation),
    CS.createGroup)
    
chatRouter.get("/group/:groupId", authentication() , CS.getGroupChats )


export default chatRouter
