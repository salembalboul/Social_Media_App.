import { appError } from "../utils/classError.js";
import { decodedTokenAndFetchUser, getSignature, TokenType, } from "../utils/token.js";
import { GraphQLError } from "graphql";
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
export const authenticationGQL = async (authorization, tokenType = TokenType.access) => {
    const [prefix, token] = authorization?.split(" ") || [];
    if (!prefix || !token) {
        throw new GraphQLError("token not exist", {
            extensions: {
                code: "UNAUTHENTICATED",
                message: "token not exist",
                statusCode: 404,
            },
        });
    }
    const signature = await getSignature(tokenType, prefix);
    if (!signature) {
        throw new GraphQLError("signature is not valid", {
            extensions: {
                code: "UNAUTHENTICATED",
                message: "signature is not valid",
                statusCode: 404,
            },
        });
    }
    const { user, decoded } = await decodedTokenAndFetchUser(token, signature);
    if (!decoded) {
        return new GraphQLError("token is not valid", {
            extensions: {
                code: "UNAUTHENTICATED",
                message: "token is not valid",
                statusCode: 404,
            },
        });
    }
    return { user, decoded };
};
//# sourceMappingURL=authentication.js.map