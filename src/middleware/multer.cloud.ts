import multer, { FileFilterCallback } from "multer";
import fs from "fs";
import path from "path";
import { Request } from "express";

export const fileValidation={
    image:["image/jpeg","image/jpg","image/png"],
    video:["video/mp4","video/mpeg","video/quicktime","video/ogg","video/webm"],
    audio:["audio/mpeg","audio/ogg","audio/wav","audio/webm"],
    pdf:["application/pdf","application/msword","application/vnd.openxmlformats-officedocument.wordprocessingml.document","application/vnd.ms-excel","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet","application/vnd.ms-powerpoint","application/vnd.openxmlformats-officedocument.presentationml.presentation"]
}

export enum storeTypeEnum{
    cloud="cloud",
    disk="disk"
}

export const MulterLocal = ({customPath="general", customExtensions= [] as string[]} = {}) => {
    
const fullPath =`uploads/${customPath}`

if(!fs.existsSync(fullPath)){

    fs.mkdirSync(fullPath,{recursive:true})
}

 const storage = multer.diskStorage({
    destination: function (req, file, cb) {
    //    console.log(file);
        cb(null, fullPath);
    },
    filename: function (req, file, cb) {
const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null,uniqueSuffix + '-' + path.extname(file.originalname)  )
   }
 });
 
 const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
if(!customExtensions.includes(file.mimetype)){
 cb(new Error("inValid file type"));
}else{
   cb(null, true);  
}
 }
const upload = multer({ storage, fileFilter });
return upload;
}

export const MulterHost = ({ customExtensions= [] as string[]} = {}) => {
    
 const storage = multer.diskStorage({ });
 
 const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
 if(!customExtensions.includes(file.mimetype)){
 
    cb(new Error("inValid file type"));
}else{
   cb(null, true);  
}

}
const upload = multer({ storage, fileFilter });
return upload;
}