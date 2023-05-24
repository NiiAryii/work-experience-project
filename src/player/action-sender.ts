import { Entity } from "../model/entity";
import { Player } from "./player";

export default class ActionSender {

    private player : Player;

    constructor(player : Player) {
        this.player = player;
    }

    createEntity(entity : Entity) : void {
        this.player.client.send("createEntity", entity);
    }

    deleteEntity(eid : number) : void {
        this.player.client.send("deleteEntity", {
            id: eid
        })
    }

}