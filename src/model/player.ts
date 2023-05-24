import { Client } from "colyseus";
import { Schema, type, MapSchema } from "@colyseus/schema";
import { Vector3 } from "../model/entity";

export class Player extends Schema {

    client = null;

    @type("string")
    accountId = null;

    position: Vector3 = null;

    constructor(client : Client) {
        super();
        this.client = client;
    }

    updatePosition(newPosition : Vector3) {
        this.position = newPosition;
    }

}