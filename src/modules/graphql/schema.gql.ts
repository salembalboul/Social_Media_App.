import { GraphQLObjectType, GraphQLSchema } from "graphql";
import userFields from "../users/graphql/user.fields.js";

export const schemaGQL = new GraphQLSchema({
  //====query====
  query: new GraphQLObjectType({
    name: "Query",
    fields: {
      ...userFields.query(),
    },
  }),

  //====mutation====
  mutation: new GraphQLObjectType({
    name: "Mutation",
    fields: {
      ...userFields.mutation(),
    },
  }),
});
