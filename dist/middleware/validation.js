import { appError } from "../utils/classError.js";
export const Validation = (schema) => {
    return (req, res, next) => {
        const ValidationErrors = [];
        for (const key of Object.keys(schema)) {
            if (!schema[key]) {
                continue;
            }
            const result = schema[key].safeParse(req[key]);
            if (!result.success) {
                ValidationErrors.push(result.error.message);
            }
        }
        if (ValidationErrors.length) {
            throw new appError(JSON.parse(ValidationErrors), 400);
        }
        next();
    };
};
