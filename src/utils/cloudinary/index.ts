import path from "path";
import dotenv from "dotenv";
dotenv.config({ path: path.resolve("./config/.env") });
import {v2 as cloudinary} from 'cloudinary'

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME!,
    api_key: process.env.API_KEY!,
    api_secret: process.env.API_SECRET!,
    
})

export default cloudinary

// class CloudinaryService {

// constructor(){
//     cloudinary.config({
//         cloud_name: process.env.cloud_name!,
//         api_key: process.env.api_key!,
//         api_secret: process.env.api_secret!,
//     })
// }

//   async uploadFile({ file, path }: { file: any, path: string }): Promise<string> {
//     try {
//       const result = await cloudinary.uploader.upload(file.path, {
//         folder: path,
//       })
//       return result.secure_url
//     } catch (e) {
//         console.log(e)
//       throw new appError('upload failed', 500)
//     }
//   }


//   async deleteFile({ path }: { path: string }) {
//     try {
//       const publicId = this.extractPublicId(path)
//       await cloudinary.uploader.destroy(publicId)
//     } catch (e) {
//         console.log(e)
//       throw new appError('delete failed', 500)
//     }
//   }

//   private extractPublicId(url: string): string {
//     const parts = url.split('/')
//     const fileName = parts[parts.length - 1]
//     return `${parts[parts.length - 2]}/${fileName?.split('.')[0]}`
//   }
// }
// export default new CloudinaryService()

