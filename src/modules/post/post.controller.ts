import {Router} from "express"
import PS from "./post.service.js"
import { authentication } from "../../middleware/authentication.js"
import { Validation } from "../../middleware/validation.js"
import { createPostValidation, getPostValidation, likePostValidation, updatePostValidation } from "./post.validation.js"
import { fileValidation, MulterHost } from "../../middleware/multer.cloud.js"
import commentRouter from "../comment/comment.controller.js"

const postRouter=Router({})
postRouter.use("/:postId/comments{/:commentId/reply}",commentRouter)

postRouter.post("/createPost",
    authentication(),
    MulterHost({customExtensions:fileValidation.image}).array("attachments", 2)
    ,Validation(createPostValidation),
    PS.createPost)
    
postRouter.patch("/:postId",
    authentication(),
    Validation(likePostValidation),
    PS.likePost)

postRouter.patch("/updatePost/:postId",
    authentication(),
    MulterHost({customExtensions:fileValidation.image}).array("attachments", 2),
    Validation(updatePostValidation),
    PS.updatePost)

postRouter.get("/:postId",
    authentication(),
    Validation(getPostValidation),
    PS.getPost)
 
postRouter.get("/",
    // authentication(),
    PS.getAllPosts)

export default postRouter  