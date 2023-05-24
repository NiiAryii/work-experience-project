import { Client } from "colyseus";
import { WorldHandler } from "./world-handler";


export default class MessageHandler {

    private worldHandler : WorldHandler;

    constructor(worldHandler : WorldHandler) {
        this.worldHandler = worldHandler;
    }

    onEntityClicked(client : Client, data : any) {
        const player = this.worldHandler.getPlayerBySessionId(client.sessionId);
        if(player) {
            console.log("[" + player.accountId + "] onEntityClicked", data);
        }
    }

    onEntityHoverEntered(client : Client, data : any) {
        const player = this.worldHandler.getPlayerBySessionId(client.sessionId);
        if(player) {
            // TODO handle
        }
    }

    onEntityHoverExit(client : Client, data : any) {
        const player = this.worldHandler.getPlayerBySessionId(client.sessionId);
        if(player) {
            // TODO handle
        }
    }

    onPositionUpdate(client : Client, data : any) {
        const player = this.worldHandler.getPlayerBySessionId(client.sessionId);
        if(player) {
            player.updatePosition(data);
        }
    }

}