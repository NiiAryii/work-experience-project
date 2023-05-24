import { createWorld } from 'bitecs'
import { Room, Client } from "colyseus";
import { Entity, Vector3 } from "../model/entity";
import jwt from 'jsonwebtoken';
import fs from 'fs';
import { State } from "../model/state";
import { HubsWorld } from '../model/world';

const publicKey = fs.readFileSync('priv/reticulum.key');

export class RoomHandler extends Room<State> {

    world: HubsWorld = null;
    state: State = null;

    maxClients = 25;
    elapsedTime = 0;
    fixedTimeStep = 500;
    lastEntityId = 0;

    constructor() {
        super();
        this.world = createWorld();
        this.world.entities = new Map<number, Entity>;
    }

    createGlobalEntities(state : State) {
        const definitions : Entity[] = JSON.parse(fs.readFileSync('data/entities.json', 'utf-8'));
        definitions.forEach((e) => {
            state.createEntity(e);
        });
    }

    onCreate (options : any) {
        this.state = new State(this.world)
        this.setState(this.state);
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

                this.world.entities.forEach((entity) => {
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