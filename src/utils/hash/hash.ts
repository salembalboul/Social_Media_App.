import {hash,compare} from "bcrypt"

export const Hash= async(plainText:string,saltRounds:number=Number(process.env.SALT_ROUNDS))=>{
    return hash(plainText,saltRounds)
}

export const Compare= async(plainText:string,cipherText:string)=>{
    return compare(plainText,cipherText)
}