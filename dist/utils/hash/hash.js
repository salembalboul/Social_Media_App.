import { hash, compare } from "bcrypt";
export const Hash = async (plainText, saltRounds = Number(process.env.SALT_ROUNDS)) => {
    return hash(plainText, saltRounds);
};
export const Compare = async (plainText, cipherText) => {
    return compare(plainText, cipherText);
};
//# sourceMappingURL=hash.js.map