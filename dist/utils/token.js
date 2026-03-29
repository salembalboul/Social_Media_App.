import jwt from 'jsonwebtoken';
import { appError } from './classError.js';
import { UserRebository } from '../DB/rebositories/user.rebos.js';
import UserModel from '../DB/model/user.model.js';
import { RevokeTokenRebository } from '../DB/rebositories/revokeToken.rebo.js';
import revokeTokenModel from '../DB/model/revokeToken.model.js';
export var TokenType;
(function (TokenType) {
    TokenType["access"] = "access";
    TokenType["refresh"] = "refresh";
})(TokenType || (TokenType = {}));
export const generateToken = async ({ payload, signature, options }) => {
    return jwt.sign(payload, signature, options);
};
export const verifyToken = async ({ token, signature }) => {
    return jwt.verify(token, signature);
};
const _userMoel = new UserRebository(UserModel);
const _revokeToken = new RevokeTokenRebository(revokeTokenModel);
export const getSignature = async (tokenType, prefix) => {
    if (tokenType === TokenType.access) {
        if (prefix === process.env.BEARER_USER) {
            return process.env.TOKEN_SIGNATURE || "";
        }
        else if (prefix === process.env.BERARER_ADMIN) {
            return process.env.ADMIN_TOKEN_SIGNATURE || "";
        }
        else {
            throw new appError("invalid prefix", 400);
        }
    }
    else if (tokenType === TokenType.refresh) {
        if (prefix === process.env.BEARER_USER) {
            return process.env.REFRESH_TOKEN_SIGNATURE || "";
        }
        else if (prefix === process.env.BERARER_ADMIN) {
            return process.env.ADMIN_REFRESH_TOKEN_SIGNATURE || "";
        }
        else {
            throw new appError("invalid prefix", 400);
        }
    }
    return null;
};
export const decodedTokenAndFetchUser = async (token, signature) => {
    const decoded = await verifyToken({ token, signature });
    if (!decoded) {
        throw new appError("invalid token", 400);
    }
    const user = await _userMoel.findOne({ email: decoded.email });
    if (!user) {
        throw new appError("user is not exist", 400);
    }
    if (!user.confirmed) {
        throw new appError("user is not confirmed", 400);
    }
    if (await _revokeToken.findOne({ tokenId: decoded?.jti })) {
        throw new appError("token is revoked , please log in again", 400);
    }
    if (user?.changeCredentials >= new Date(decoded.iat * 1000)) {
        throw new appError("email is logged out ", 400);
    }
    return { decoded, user };
};
