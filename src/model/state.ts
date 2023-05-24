
import { IWorld, addEntity, createWorld } from 'bitecs'
import { Client } from "colyseus";
import { Schema, type, MapSchema } from "@colyseus/schema";
import { Entity, Vector3 } from "./entity";
import { Player } from "./player";
import { HubsWorld } from './world';

export class State extends Schema {

    world: HubsWorld;

    entities = new Map<string, Entity>();

    @type({ map: Player })
    players = new MapSchema<Player>();

    constructor(world: HubsWorld) {
        super();
        this.world = world;
    }

    createPlayer(client : Client) : Player {
        const player = new Player(client);
        this.players.set(client.sessionId, player);
        return player;
    }
  
    removePlayer(sessionId: string) {
        this.players.delete(sessionId);
    }

    createEntity(entity : Entity) {
        const eid = addEntity(this.world);
        this.world.entities.set(eid, entity);
        entity.id = eid;
    }

}