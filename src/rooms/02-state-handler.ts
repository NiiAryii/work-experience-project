import { Room, Client } from "colyseus";
import { Schema, type, MapSchema } from "@colyseus/schema";
import { Entity, Vector3 } from "../model/entity";
import jwt from 'jsonwebtoken';
import fs from 'fs';

// Read the RSA private key from a file
const publicKey = fs.readFileSync('priv/reticulum.key');

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

    spawnGlobalObjects(state : State) {
        
        // global entities
        state.createEntity({
            id: "1",
            name: "test",
            type: "box",
            color: "red",
            opacity: 0.85,
            grabable: true,
            position: { x: 0, y: 2, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            scale: { x: 1, y: 1, z: 1 },
            shape: {
                width: 0.25,
                height: 0.25,
                depth: 0.25
            }
        });   

        state.createEntity({
            id: "2",
            name: "box2",
            type: "box",
            color: "green",
            opacity: 0.85,
            grabable: true,
            position: { x: 2, y: 2, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            scale: { x: 1, y: 1, z: 1 },
            shape: {
                width: 0.25,
                height: 0.25,
                depth: 0.25
            }
        });   

        state.createEntity({
            id: "3",
            name: "box",
            type: "box",
            color: "blue",
            opacity: 0.85,
            grabable: true,
            position: { x: 4, y: 2, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            scale: { x: 1, y: 1, z: 1 },
            shape: {
                width: 0.25,
                height: 0.25,
                depth: 0.25
            }
        });  

    }

    onCreate (options : any) {
        const state = new State()
        this.setState(state);

        // fixed tick event 
        this.setSimulationInterval((deltaTime) => {
            this.elapsedTime += deltaTime;
            while (this.elapsedTime >= this.fixedTimeStep) {
                this.elapsedTime -= this.fixedTimeStep;
                this.onTick();
            }
        });

        this.onMessage("onEntityClicked", (client, data) => {
            client.send("playSound", {
                soundId: "../assets/sfx/specialquack.mp3"
            })
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

        this.spawnGlobalObjects(this.state);
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