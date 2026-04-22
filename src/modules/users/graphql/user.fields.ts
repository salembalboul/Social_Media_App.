import { GraphQLList } from "graphql";
import { userType } from "./user.types.js";
import { GenderType } from "../../../DB/model/user.model.js";
import userService from "../user.service.js";
import * as userArgs from "./user.args.js";

// export const arr = [
//   {
//     id: 1,
//     name: "Ahmed",
//     password: "123456",
//     email: "ahmed@gmail.com",
//     gender: GenderType.male,
//   },
//   {
//     id: 2,
//     name: "Mohamed",
//     password: "123456",
//     email: "mohamed@gmail.com",
//     gender: GenderType.male,
//   },
//   {
//     id: 3,
//     name: "Ali",
//     password: "123456",
//     email: "ali@gmail.com",
//     gender: GenderType.male,
//   },
//   {
//     id: 4,
//     name: "Omar",
//     password: "123456",
//     email: "omar@gmail.com",
//     gender: GenderType.male,
//   },
//   {
//     id: 5,
//     name: "Sara",
//     password: "123456",
//     email: "sara@gmail.com",
//     gender: GenderType.female,
//   },
// ];

class UserFields {
  constructor() {}

  //====query====
  query = () => {
    return {
      //====getUser=====
      getUser: {
        type: userType,
        args: userArgs.getUserArgs,
        resolve: userService.getUser,
      },

      //====getUsers=====
      getusers: {
        type: new GraphQLList(userType),

        resolve: userService.getusers,
      },
    };
  };

  //====mutation====
  mutation = () => {
    return {
      adduser: {
        type: userType,

        args: userArgs.addUserArgs,
        resolve: userService.adduser,
      },
    };
  };
}

export default new UserFields();
