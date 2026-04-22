import { appError } from "../utils/classError.js";
import { GraphQLError } from "graphql";
export const Validation = (schema) => {
    return (req, res, next) => {
        const ValidationErrors = [];
        for (const key of Object.keys(schema)) {
            if (!schema[key]) {
                continue;
            }
            if (req?.file) {
                req.body.attachment = req.file;
            }
            if (req?.files) {
                req.body.attachment = req.files;
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
export const ValidationGQL = async (schema, args) => {
    const errorResult = [];
    const result = schema.safeParse(args);
    if (!result.success) {
        errorResult.push(result.error.message);
    }
    if (errorResult.length) {
        throw new GraphQLError("validation error", {
            extensions: {
                code: "VALIDATION_ERROR",
                http: { status: 400 },
                errors: JSON.parse(errorResult),
            },
        });
    }
};
//# sourceMappingURL=validation.js.map