import { NextFunction, Request, Response } from "express";
import { appError } from "../utils/classError.js";
import { RoleType } from "../DB/model/user.model.js";
import { GraphQLError } from "graphql";

export const authorization = ({
  accessRoles = [],
}: {
  accessRoles: RoleType[];
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!accessRoles || accessRoles.length === 0) {
      throw new appError("authorization roles not configured", 500);
    }

    const user = req?.user;

    if (!accessRoles.includes(user?.role!)) {
      throw new appError("unauthorized", 401);
    }
    return next();
  };
};

export const authorizationGQL = async ({
  role,
  accessRoles = [],
}: {
  accessRoles: RoleType[];
  role: RoleType;
}) => {
  if (!accessRoles || accessRoles.length === 0) {
    throw new GraphQLError("authorization roles not configured", {
      extensions: {
        code: "UNAUTHENTICATED",
        message: "authorization roles not configured",
        statusCode: 500,
      },
    });
  }

  if (!accessRoles.includes(role)) {
    throw new GraphQLError("unauthorized", {
      extensions: {
        code: "UNAUTHENTICATED",
        message: "unauthorized",
        statusCode: 401,
      },
    });
  }
  return true;
};
