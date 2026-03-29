import { NextFunction, Request, Response } from "express"
import { ZodType } from "zod"
import { appError } from "../utils/classError.js"
    
type ReqType=keyof Request 
type SchemaType=Partial<Record<ReqType,ZodType>>


export const Validation=(schema:SchemaType)=>{

return (req:Request,res:Response,next:NextFunction)=>{
     
const ValidationErrors=[]

for(const key of Object.keys(schema) as ReqType[]){
    
if(!schema[key]){continue}

 const result=schema[key].safeParse(req[key])

 if(!result.success){
    ValidationErrors.push(result.error.message)
 }
}
if(ValidationErrors.length){
    throw new appError(JSON.parse(ValidationErrors as unknown as string),400)
}
    next()
}
}

