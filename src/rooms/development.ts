import { Room, Client } from "colyseus";
import { Schema, type, MapSchema } from "@colyseus/schema";
import { Entity, Vector3 } from "../model/entity";
import jwt from 'jsonwebtoken';
import fs from 'fs';

// Read the RSA private key from a file
const publicKey = fs.readFileSync('priv/reticulum.key');
const entityList : Entity[] = JSON.parse(fs.readFileSync('data/entities.json', 'utf-8'));

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

export class State extends Schema {

    entities = new Map<string, Entity>();

    @type({ map: Player })
    players = new MapSchema<Player>();
    
    @type("string")
    hubId = null;

    createPlayer(client : Client) : Player {
        const player = new Player(client);
        this.players.set(client.sessionId, player);
        return player;
    }
  
    removePlayer(sessionId: string) {
        this.players.delete(sessionId);
    }

    createEntity(entity : Entity) {
        this.entities.set(entity.id, entity);
    }

}

export class StateHandlerRoom extends Room<State> {

    maxClients = 25;
    elapsedTime = 0;
    fixedTimeStep = 500;
    lastEntityId = 0;

    createGlobalEntities(state : State) {
        entityList.forEach((e) => {
            state.createEntity(e);
        });
    }

    onCreate (options : any) {
        const state = new State()
        this.setState(state);
        this.createGlobalEntities(this.state);
        
        this.onMessage("onEntityClicked", (client, data) => {
            // TODO handle
        })

        this.onMessage("onEntityHoverEntered", (client, data) => { 
            // TODO handle
        })

        this.onMessage("onEntityHoverExit", (client, data) => { 
            // TODO handle
        })
 
        // handle client position updates
        this.onMessage("updatePosition", (client, data) => {
            const player = this.state.players[client.sessionId];
            if(player) {
                player.updatePosition(data);
            }
        });  

        // fixed tick event 
        this.setSimulationInterval((deltaTime) => {
            this.elapsedTime += deltaTime;
            while (this.elapsedTime >= this.fixedTimeStep) {
                this.elapsedTime -= this.fixedTimeStep;
                this.onTick();
            }
        });
    }

    onTick() {
        // handle game loop
    }

    onJoin (client: Client, options: any) {
        // verify the client is authenticated
        jwt.verify(options.token, publicKey, { algorithms: ['RS512'] }, (err, decoded) => {
            if (err) {
                console.error('JWT verification failed:', err);
            } else {
                // create player
                const hubId = decoded.hub_id;
                const player = this.state.createPlayer(client);
                player.accountId = decoded.account_id;

                console.log("[" + player.accountId + "]: entered the room")

                this.state.entities.forEach((entity) => {
                    client.send("createEntity", entity);
                });

                setTimeout(() => {
                    // delete entity
                    client.send("deleteEntity", {
                        id: 1
                    })
                }, 600000);                
            }
        });
    }

    onLeave (client : Client) {
        const player = this.state.players[client.sessionId];
        if(player) {
            console.log("[" + player.accountId + "]: left the room")
            this.state.removePlayer(client.sessionId);
        }
    }

    onDispose () {
        // room destruction event
    }

}