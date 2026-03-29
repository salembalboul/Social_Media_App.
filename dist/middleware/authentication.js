import { appError } from "../utils/classError.js";
import { decodedTokenAndFetchUser, getSignature, TokenType } from "../utils/token.js";
export const authentication = (tokenType = TokenType.access) => {
    return async (req, res, next) => {
        const { authorization } = req.headers;
        const [prefix, token] = authorization?.split(" ") || [];
        if (!prefix || !token) {
            throw new appError("token not exist", 400);
        }
        const signature = await getSignature(tokenType, prefix);
        if (!signature) {
            throw new appError("signature is not valid", 400);
        }
        const decoded = await decodedTokenAndFetchUser(token, signature);
        if (!decoded) {
            throw new appError("token is not valid", 400);
        }
        req.user = decoded?.user;
        req.decoded = decoded?.decoded;
        return next();
    };
};
