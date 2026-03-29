import { EventEmitter }  from "events";
import {  sendEmail } from "./sendEmail.js";
import { emailTemplate } from "./email.template.js";
const eventEmitter = new EventEmitter()


eventEmitter.on("confirmEmail",async (data)=>{
   const {email,otp} = data
    
   await sendEmail({to:email,subject:"Otp",html:emailTemplate(otp as unknown as string,"Email Confirmation")})

})

eventEmitter.on("forgetPassword",async (data)=>{
   const {email,otp} = data
    
   await sendEmail({to:email,subject:"forgetPassword",html:emailTemplate(otp as unknown as string,"Forget Password")})

})

export default eventEmitter