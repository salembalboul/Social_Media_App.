import multer from "multer";
import os from "os";
import { v4 as uuidv4 } from 'uuid';
import { appError } from "../utils/classError.js";
export const fileValidation = {
    image: ["image/jpeg", "image/jpg", "image/png"],
    video: ["video/mp4", "video/mpeg", "video/quicktime", "video/ogg", "video/webm"],
    audio: ["audio/mpeg", "audio/ogg", "audio/wav", "audio/webm"],
    document: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation"]
};
export var storeTypeEnum;
(function (storeTypeEnum) {
    storeTypeEnum["cloud"] = "cloud";
    storeTypeEnum["disk"] = "disk";
})(storeTypeEnum || (storeTypeEnum = {}));
export const multerCloud = ({ fileTypes = fileValidation.image, storeTypes = storeTypeEnum.cloud, maxSize = 5 }) => {
    const storage = storeTypes === storeTypeEnum.cloud ? multer.memoryStorage() : multer.diskStorage({
        destination: os.tmpdir(),
        filename: (req, file, cb) => {
            cb(null, `${uuidv4()}_${file.originalname}`);
        }
    });
    const fileFilter = (req, file, cb) => {
        if (fileTypes.includes(file.mimetype)) {
            return cb(null, true);
        }
        else {
            return cb(new appError("invalid file type", 400));
        }
    };
    const upload = multer({ storage, limits: { fileSize: 1024 * 1024 * maxSize }, fileFilter });
    return upload;
};
