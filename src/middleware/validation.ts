import { NextFunction, Request, Response } from "express";
import { ZodType } from "zod";
import { appError } from "../utils/classError.js";
import { GraphQLError } from "graphql";

type ReqType = keyof Request;
type SchemaType = Partial<Record<ReqType, ZodType>>;

export const Validation = (schema: SchemaType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const ValidationErrors = [];

    for (const key of Object.keys(schema) as ReqType[]) {
      if (!schema[key]) {
        continue;
      }

      if (req?.file) {
        //  console.log(req.file)
        req.body.attachment = req.file;
      }

      if (req?.files) {
        //  console.log(req.files)
        req.body.attachment = req.files;
      }
      const result = schema[key].safeParse(req[key]);

      if (!result.success) {
        ValidationErrors.push(result.error.message);
      }
    }
    if (ValidationErrors.length) {
      throw new appError(
        JSON.parse(ValidationErrors as unknown as string),
        400,
      );
    }
    next();
  };
};

export const ValidationGQL = async <T>(schema: ZodType, args: T) => {
  const errorResult: string[] = [];

  const result = schema.safeParse(args);

  if (!result.success) {
    errorResult.push(result.error.message);
  }

  if (errorResult.length) {
    throw new GraphQLError("validation error", {
      extensions: {
        code: "VALIDATION_ERROR",
        http: { status: 400 },
        errors: JSON.parse(errorResult as unknown as string),
      },
    });
  }
};
