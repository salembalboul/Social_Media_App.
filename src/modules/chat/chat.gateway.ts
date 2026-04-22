import { Server, Socket } from "socket.io";
import { ChatEvents } from "./chat.events.js";

export class ChatGateway {

    private chatEvents: ChatEvents=new ChatEvents();
    constructor() {}

register = (socket : Socket,io:Server)=>{
    this.chatEvents.sayHi(socket,io);
    this.chatEvents.sendMessage(socket,io);
    this.chatEvents.join_room(socket,io)
    this.chatEvents.sendGroupMessage(socket,io)
    
};

}