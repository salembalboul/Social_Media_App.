import { EventEmitter }  from "events";
import { sendEmail } from "./sendEmail.js";
import { emailTemplate } from "./email.template.js";
import { deleteFile, getFile } from "../utils/s3.config.js";
import { UserRebository } from "../DB/rebositories/user.rebos.js";
import UserModel from "../DB/model/user.model.js";
const eventEmitter = new EventEmitter()


eventEmitter.on("confirmEmail",async (data)=>{
   const {email,otp} = data
    
   await sendEmail({to:email,subject:"Otp",html:emailTemplate(otp as unknown as string,"Email Confirmation")})

})

eventEmitter.on("forgetPassword",async (data)=>{
   const {email,otp} = data
    
   await sendEmail({to:email,subject:"forgetPassword",html:emailTemplate(otp as unknown as string,"Forget Password")})

})

eventEmitter.on("uploadProfileImage",async (data)=>{
   const {userId,oldKey,Key,expiresIn} = data
   const _userModel = new UserRebository(UserModel)
   setTimeout(async()=>{
try{
   await getFile({Key})
   await _userModel.findOneAndUpdate( {_id:userId } ,{ $unset:{ tempProfileImage: "" } })

   if(oldKey){
    await deleteFile({Key:oldKey}) }
}
catch(error:any){
   
if(error.code === "NoSuchKey"){
if(!oldKey){
await _userModel.findOneAndUpdate( {_id:userId } ,{ $unset:{ profileImage: "" } })
}
else{
   await _userModel.findOneAndUpdate( {_id:userId } ,{ $set:{ profileImage: oldKey } ,$unset:{ tempProfileImage: "" } })
} }
}
},expiresIn*1000)

})



export default eventEmitter