import {Router} from "express"
import CS from "./comment.service.js"
import { authentication } from "../../middleware/authentication.js"
import { Validation } from "../../middleware/validation.js"
import { createCommentValidation } from "./comment.validation.js"
import { fileValidation, MulterHost } from "../../middleware/multer.cloud.js"

const commentRouter=Router({mergeParams:true})

commentRouter.post("/",
    authentication(),
    MulterHost({customExtensions:fileValidation.image}).array("attachments", 2)
    ,Validation(createCommentValidation),
    CS.createComment)


export default commentRouter   