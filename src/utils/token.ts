import jwt, { JwtPayload } from 'jsonwebtoken';
import { appError } from './classError.js';
import { UserRebository } from '../DB/rebositories/user.rebos.js';
import UserModel from '../DB/model/user.model.js';
import { RevokeTokenRebository } from '../DB/rebositories/revokeToken.rebo.js';
import revokeTokenModel from '../DB/model/revokeToken.model.js';



export enum TokenType{
  access = "access",
  refresh = "refresh"  
}

//     ============generateToken==============
export const generateToken = async({payload , signature , options}:
    {payload:object , signature:string , options?:jwt.SignOptions}) : Promise<string> => {

return jwt.sign(payload, signature,options)

};

//     ============verifyToken==============
export const verifyToken = async({token,signature}: {token:string,signature:string}): Promise<JwtPayload>=> {
    
    return jwt.verify(token,signature) as JwtPayload
};


const _userMoel= new UserRebository(UserModel)
const _revokeToken = new RevokeTokenRebository(revokeTokenModel)

//     ============getSignature==============
export const getSignature= async(tokenType:TokenType,prefix:string) => {
  
if(tokenType === TokenType.access){
   if(prefix ===process.env.BEARER_USER){
      return process.env.TOKEN_SIGNATURE ||""}

else if(prefix === process.env.BERARER_ADMIN){
  return process.env.ADMIN_TOKEN_SIGNATURE ||""}

else{
    throw new appError("invalid prefix",400)}
}

else if(tokenType === TokenType.refresh){
 if(prefix ===process.env.BEARER_USER){
      return process.env.REFRESH_TOKEN_SIGNATURE ||""}

else if(prefix === process.env.BERARER_ADMIN){
  return process.env.ADMIN_REFRESH_TOKEN_SIGNATURE ||""}

else{
    throw new appError("invalid prefix",400)}
}

  return null
}

//     ============decodedTokenAndFetchUser==============
export const decodedTokenAndFetchUser = async(token:string,signature:string) => {

  const decoded = await verifyToken({ token, signature });

  if (!decoded) {
    throw new appError("invalid token",400 ); }

  const user = await _userMoel.findOne({ email: decoded.email })
  if (!user) {
    throw new appError("user is not exist",400 );
  }
  if(!user.confirmed){
    throw new appError("user is not confirmed",400)}

if(await _revokeToken.findOne({tokenId: decoded?.jti!})){
  throw new appError("token is revoked , please log in again",400)
}

if(user?.changeCredentials! >= new Date(decoded.iat! *1000)){
  throw new appError("email is logged out ",400)
}    

return {decoded,user}

}
