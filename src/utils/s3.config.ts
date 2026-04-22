import { DeleteObjectCommand, DeleteObjectCommandOutput, DeleteObjectsCommand, DeleteObjectsCommandOutput, GetObjectCommand, GetObjectCommandOutput, ListObjectsV2Command, ObjectCannedACL, PutObjectCommand, S3Client} from "@aws-sdk/client-s3"
import { storeTypeEnum } from "../middleware/multer.cloud.js";
import { createReadStream } from 'fs';
import { appError } from "./classError.js";
import { uuidv4 } from "zod";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

export const s3client =()=>{

    return new S3Client({
        region:process.env.AWS_REGION!,
        credentials:{
            accessKeyId:process.env.AWS_ACCESS_KEY_ID!,
            secretAccessKey:process.env.AWS_SECRET_ACCESS_KEY!
        }
    })        
} 
//======uploadFile=======
export const uploadFile = async ({
  storeType = storeTypeEnum.cloud,
  Bucket = process.env.AWS_BUCKET_NAME as string,
  path = "general",
  ACL = "private" as ObjectCannedACL,
  file,
}: {
  storeType?: storeTypeEnum;
  Bucket?: string;
  path?: string | undefined;
  ACL?: ObjectCannedACL;
  file: Express.Multer.File; 
}): Promise<string> => {
  const command = new PutObjectCommand({
    Bucket,
    ACL,
    Key: `${process.env.APPLICATION_NAME}/${path}/${uuidv4()}/${file.originalname}`,
    Body: storeType === storeTypeEnum.cloud ? file.buffer : createReadStream(file.path),
    ContentType: file.mimetype,
  });

  await s3client().send(command);
  if (!command.input?.Key) {
    throw new appError("Fail to upload", 500);
  }
  return command.input.Key;
};

//======uploadLargeFile=======
export const uploadLargeFile = async ({
  storeType = storeTypeEnum.cloud,
  Bucket = process.env.AWS_BUCKET_NAME as string,
  path = "general",
  ACL = "private" as ObjectCannedACL,
  file,
}: {
  storeType?: storeTypeEnum;
  Bucket?: string;
  path?: string | undefined;
  ACL?: ObjectCannedACL;
  file: Express.Multer.File;
}): Promise<string> => {
  const upload = new Upload({
    client: s3client(),
    params: {
      Bucket,
      Key: `${process.env.APPLICATION_NAME}/${path}/${uuidv4()}/${file.originalname}`,
      ACL,
      Body: storeType === storeTypeEnum.cloud ? file.buffer : createReadStream(file.path),
      ContentType: file.mimetype,
    },
  });

  upload.on("httpUploadProgress", (progress) => {
    console.log(`File upload progress is ::: `, progress);
  });
  
const { Key } = await upload.done();
if (!Key) {
  throw new appError("Failed to upload file: No key returned from S3", 500);
}
return Key;
};

//======uploadFiles=======
export const uploadFiles = async ({
  files,
  storeType = storeTypeEnum.cloud,
  path = "general",
  Bucket = process.env.AWS_BUCKET_NAME as string,
  ACL = "private" as ObjectCannedACL,
  useLarge =false 
}: {
  storeType?: storeTypeEnum;
  Bucket?: string;
  path?: string;
  ACL?: ObjectCannedACL;
  files: Express.Multer.File[];
  useLarge?: boolean;
}): Promise<string[] | any> => {

  let urls:string[] =[]
  if(useLarge ==true){
    
  urls= await Promise.all(
    files.map( (file) => uploadLargeFile({ storeType, Bucket, ACL, path, file }) ) );
  }
  else{
    
  urls= await Promise.all(
    files.map( (file) => uploadFile({ storeType, Bucket, ACL, path, file }) ) );
  }
  return urls;
};

//======Create upload  presignedUrl=======
export const createUploadPresignedUrl = async ({
  Bucket = process.env.AWS_BUCKET_NAME as string,
  path = "general",
  originalname,
  contentType,
  expiresIn = 3600,
}: {
  Bucket?: string;
  path?: string;
  originalname: string;
  contentType: string;
  expiresIn?: number;
}) => {
  const Key = `${process.env.APPLICATION_NAME}/${path}/${uuidv4()}_${originalname}`;
  
  const command = new PutObjectCommand({ Bucket, Key, ContentType: contentType });

  const url = await getSignedUrl(s3client(), command, { expiresIn }); 
  return { url, Key };
}

//======getFile=======
export const getFile = async ({
  Bucket = process.env.AWS_BUCKET_NAME as string,
  Key,
}: {
  Bucket?: string;
  Key: string;
}): Promise<GetObjectCommandOutput> => {

  const command = new GetObjectCommand( { Bucket, Key } );
  return await s3client().send(command);
};

//=============createGetPresignedUrl=============
export const createGetPresignedUrl = async ({
  Bucket = process.env.AWS_BUCKET_NAME as string,
  Key,
  expiresIn = 60,
  downloadName
}: {
  Bucket?: string;
  Key: string;
  expiresIn?: number;
  downloadName?: string | undefined;
}) => {
  const command = new GetObjectCommand({
    Bucket,
    Key,
    ResponseContentDisposition: downloadName ? `attachment; filename="${downloadName}"` : undefined,
  });
  const url = await getSignedUrl(s3client(), command, { expiresIn }); 
  return url;
};

//=============deleteFile=============
export const deleteFile = async ({
  Bucket = process.env.AWS_BUCKET_NAME as string,
  Key,
}: {
  Bucket?: string;
  Key: string;
}): Promise<DeleteObjectCommandOutput> => {
  const command = new DeleteObjectCommand({
    Bucket,
    Key,
  });
  return await s3client().send(command);
};

//=============deleteFiles=============
export const deleteFiles = async ({
  Bucket = process.env.AWS_BUCKET_NAME!,
  urls,
  Quiet = false,
}: {
  Bucket?: string;
  urls: string[];
  Quiet?: boolean;
}): Promise<DeleteObjectsCommandOutput> => {

  // const mappedKeysToDelete: { Key: string }[] = 
  

  const command = new DeleteObjectsCommand({
    Bucket,
    Delete: {
      Objects: urls.map(url => ({Key:url})),
      Quiet,
    },
  });
  return await s3client().send(command);
  
};

//=============listFiles=============
export const listFiles = async ({
  Bucket = process.env.AWS_BUCKET_NAME as string,
  path,
}: {
  Bucket?: string;
  path: string;
}) => {
  const command = new ListObjectsV2Command({
    Bucket,
    Prefix: `${process.env.APPLICATION_NAME}/${path}`,
  });

    return await s3client().send(command);
 
};

//=============deleteFolderByPrefix=============
export const deleteFolderByPrefix = async ({
  Bucket = process.env.AWS_BUCKET_NAME as string,
  Quiet = false,
  path,
}: {
  Bucket?: string;
  Quiet?: boolean;
  path: string;
}) => {
  const result = await listFiles({ path });
  const keysToDelete: string[] = result.Contents?.map((obj) => {
    return obj.Key!;
  }) as string[];

  return await deleteFiles({ urls: keysToDelete, Quiet });
};
