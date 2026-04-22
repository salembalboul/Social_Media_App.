import {
  GraphQLEnumType,
  GraphQLID,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLString,
} from "graphql";
import { GenderType } from "../../../DB/model/user.model.js";

export const getUserArgs = {
  id: { type: new GraphQLNonNull(GraphQLID) },
};

export const addUserArgs = {
  fName: { type: new GraphQLNonNull(GraphQLString) },
  lName: { type: new GraphQLNonNull(GraphQLString) },
  email: { type: new GraphQLNonNull(GraphQLString) },
  age: { type: new GraphQLNonNull(GraphQLInt) },
  password: { type: new GraphQLNonNull(GraphQLString) },
  gender: {
    type: new GraphQLNonNull(
      new GraphQLEnumType({
        name: "GenderEnum",
        values: {
          male: { value: GenderType.male },
          female: { value: GenderType.female },
        },
      }),
    ),
  },
};
