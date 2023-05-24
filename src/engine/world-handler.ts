
import { IWorld, addEntity, createWorld } from 'bitecs'
import { Client } from "colyseus";
import { Schema, type, MapSchema } from "@colyseus/schema";
import { Player } from "../player/player";
import { Entity } from '../model/entity';

export interface HubsWorld extends IWorld {

    entities: Map<number, Entity>;
    time: { delta: number; elapsed: number; tick: number };

}

export class WorldHandler extends Schema {

    world: HubsWorld;

    @type({ map: Player })
    players = new MapSchema<Player>();

    constructor(world: HubsWorld) {
        super();
        this.world = world;
    }

    tick() : void {
        this.players.forEach((player) => {
            player.tick();
        })
    }

    createPlayer(client : Client) : Player {
        const player = new Player(client);
        this.players.set(client.sessionId, player);
        player.login();
        return player;
    }
  
    removePlayer(sessionId: string) {
        const player = this.players.get(sessionId);
        if(player) {
            this.players.delete(sessionId);
            player.logout();
        }
    }

    createEntity(entity : Entity) {
        const eid = addEntity(this.world);
        this.world.entities.set(eid, entity);
    }

    destroy() : void {
        // TODO handle cleanup
    }

}