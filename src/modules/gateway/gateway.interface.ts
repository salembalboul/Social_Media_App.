import { Socket } from "socket.io"
import { HydratedDocument } from "mongoose"
import { IUser } from "../../DB/model/user.model.js"
import { JwtPayload } from "jsonwebtoken"

export interface SocketWithUser extends Socket {
    user?: Partial<HydratedDocument<IUser>>
    decoded?:JwtPayload
}
