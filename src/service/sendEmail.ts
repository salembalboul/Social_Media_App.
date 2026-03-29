import nodemailer from "nodemailer";
import { MailOptions } from "nodemailer/lib/json-transport/index.js";

export const sendEmail= async(mailOptions:MailOptions)=>{
 

const transporter = nodemailer.createTransport({
  service: "gmail",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

  const info = await transporter.sendMail({
    from: `"SocialMediaApp" <${process.env.EMAIL_USER}>`,
    ...mailOptions
  });

  // console.log("Message sent:", info.messageId);
}


export const generateOtp= async()=>{
 
return Math.floor(Math.random() * (999999-100000+1)+100000) 

}


