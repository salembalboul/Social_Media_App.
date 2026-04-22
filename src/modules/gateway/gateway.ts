import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { appError } from "../../utils/classError.js";
import { decodedTokenAndFetchUser, getSignature, TokenType } from "../../utils/token.js";
import { ChatGateway } from "../chat/chat.gateway.js";

export const connectionSockets = new Map<string,string[]>()
let io :Server | undefined = undefined

export const intialiazationIo =(httpServer:HttpServer)=>{

 // initialize socket.io   
io = new Server(httpServer,{
  cors: {
    origin: "*"
  }
})

// middleware
io.use( async(socket:Socket,next ) => {

try{
    const { authorization  } = socket.handshake.auth;
    const [prefix, token] = authorization?.split(" ") || [];
    
    if (!prefix || !token) {
        next(new appError("token not exist",400 ))
    }
    
const signature = await getSignature(TokenType.access,prefix)  //access or refresh
    
if(!signature){ 
        next(new appError("signature is not valid",400))
 }
    
const {user,decoded} =await decodedTokenAndFetchUser(token,signature as string)
   
if(!decoded){ 
        next(new appError("token is not valid",400)) 
    }

const socketIds= connectionSockets.get(user._id.toString()) || [];
    socketIds.push(socket.id)

connectionSockets.set(user._id.toString(),socketIds)
    socket.data.user=user
    socket.data.decoded=decoded

    next()
    
}
catch(error:any){
    next(error)
}

})

const chatGateway: ChatGateway= new ChatGateway()

// socket connection
io.on("connection",(socket:Socket)=>{
 chatGateway.register(socket,getIo())

const userId: string = socket.data?.user?._id?.toString()!

//remove socket (disconnect)
const removeSocket = (userId: string) => {
  const tabs = connectionSockets.get(userId)

  let remainingTabs = tabs?.filter(tabId => tabId !== socket.id)

  if (remainingTabs?.length) {
    connectionSockets.set(userId, remainingTabs)
  } else {
    connectionSockets.delete(userId)
  }

  getIo().emit("offline_user", { userId })
}
// console.log(connectionSockets);

socket.on("disconnecting",()=>{
    removeSocket(userId)
   })
})

}
const getIo=()=>{
  if(!io){
    throw new appError("io is not initialized",500)
  }
  return io
}