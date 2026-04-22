import { Server, Socket } from "socket.io";
import { ChatService } from "./chat.service.js";
export class ChatEvents {

  private _chatService: ChatService=new ChatService();
    constructor() {}

    sayHi = (socket:Socket,io:Server) => {
       return socket.on('sayHi',(data:any,callback:any) => {
        this._chatService.sayHi(data,callback,socket,io);

       });
    }
       sendMessage = (socket:Socket,io:Server) => {
       return socket.on('sendMessage',(data:any) => {
        this._chatService.sendMessage(data,socket,io);
       });
    }
    join_room = (socket:Socket,io:Server) => {
       return socket.on('join_room',(data:any) => {
        this._chatService.join_room(data,socket,io);
       });
    }
    sendGroupMessage = (socket:Socket,io:Server) => {
       return socket.on('sendGroupMessage',(data:any) => {
        this._chatService.sendGroupMessage(data,socket,io);
       });
    }
    
}
