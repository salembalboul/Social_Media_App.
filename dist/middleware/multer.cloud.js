import multer from "multer";
import fs from "fs";
import path from "path";
export const fileValidation = {
    image: ["image/jpeg", "image/jpg", "image/png"],
    video: ["video/mp4", "video/mpeg", "video/quicktime", "video/ogg", "video/webm"],
    audio: ["audio/mpeg", "audio/ogg", "audio/wav", "audio/webm"],
    pdf: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation"]
};
export var storeTypeEnum;
(function (storeTypeEnum) {
    storeTypeEnum["cloud"] = "cloud";
    storeTypeEnum["disk"] = "disk";
})(storeTypeEnum || (storeTypeEnum = {}));
export const MulterLocal = ({ customPath = "general", customExtensions = [] } = {}) => {
    const fullPath = `uploads/${customPath}`;
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
    }
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, fullPath);
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, uniqueSuffix + '-' + path.extname(file.originalname));
        }
    });
    const fileFilter = (req, file, cb) => {
        if (!customExtensions.includes(file.mimetype)) {
            cb(new Error("inValid file type"));
        }
        else {
            cb(null, true);
        }
    };
    const upload = multer({ storage, fileFilter });
    return upload;
};
export const MulterHost = ({ customExtensions = [] } = {}) => {
    const storage = multer.diskStorage({});
    const fileFilter = (req, file, cb) => {
        if (!customExtensions.includes(file.mimetype)) {
            cb(new Error("inValid file type"));
        }
        else {
            cb(null, true);
        }
    };
    const upload = multer({ storage, fileFilter });
    return upload;
};
//# sourceMappingURL=multer.cloud.js.map