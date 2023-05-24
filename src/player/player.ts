import { Client } from "colyseus";
import { Schema, type, MapSchema } from "@colyseus/schema";
import { Vector3 } from "../model/entity";
import ActionSender from "./action-sender";

export class Player extends Schema {

    accountId = null;
    position: Vector3 = null;
    client : Client = null;
    actionSender : ActionSender;

    constructor(accountId : string, client : Client) {
        super();
        this.client = client;
        this.accountId = accountId;
        this.actionSender = new ActionSender(this)
    }

    send(eventName : string, payload : any) {
        this.client.send(eventName, payload);
    }

    updatePosition(newPosition : Vector3) {
        this.position = newPosition;
    }

    login() {
        console.log("[" + this.accountId + "]", "entered the world")
    }

    logout() {
        console.log("[" + this.accountId + "]", "left the world")
    }

    tick() : void {
        // tick is called every 500 milliseconds
    }

}