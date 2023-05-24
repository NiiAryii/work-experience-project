import { Client } from "colyseus";
import { Schema, type, MapSchema } from "@colyseus/schema";
import { Vector3 } from "../model/entity";
import ActionSender from "./action-sender";

export class Player extends Schema {

    client = null;

    accountId = null;

    position: Vector3 = null;

    actionSender : ActionSender;

    constructor(client : Client) {
        super();
        this.client = client;
        this.actionSender = new ActionSender(this);
    }

    updatePosition(newPosition : Vector3) {
        this.position = newPosition;
    }

}