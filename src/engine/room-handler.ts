import { createWorld } from 'bitecs'
import { Room, Client } from "colyseus";
import { Entity, Vector3 } from "../model/entity";
import jwt from 'jsonwebtoken';
import fs from 'fs';
import { HubsWorld, WorldHandler } from './world-handler';

const publicKey = fs.readFileSync('priv/reticulum.key');

export class RoomHandler extends Room<WorldHandler> {

    maxClients = 25;

    world: HubsWorld = null;
    worldHandler: WorldHandler = null;

    constructor() {
        super();
        this.world = createWorld();
        this.world.entities = new Map<number, Entity>;
    }

    loadEntities(worldHandler : WorldHandler) {
        const definitions : Entity[] = JSON.parse(fs.readFileSync('data/entities.json', 'utf-8'));
        definitions.forEach((e) => {
            worldHandler.createEntity(e);
        });
    }

    onCreate (options : any) {

        let elapsedTime = 0;
        let fixedTimeStep = 500;

        this.worldHandler = new WorldHandler(this.world)
        this.setState(this.worldHandler);
        this.loadEntities(this.worldHandler);
        
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
            const player = this.worldHandler.players[client.sessionId];
            if(player) {
                player.updatePosition(data);
            }
        });  

        // fixed tick event 
        this.setSimulationInterval((deltaTime) => {
            elapsedTime += deltaTime;
            while (elapsedTime >= fixedTimeStep) {
                elapsedTime -= fixedTimeStep;
                this.worldHandler.tick();
            }
        });
    }
    
    onJoin (client: Client, options: any) {
        // verify the client is authenticated
        jwt.verify(options.token, publicKey, { algorithms: ['RS512'] }, (err, decoded) => {
            if (err) {
                console.error('JWT verification failed:', err);
            } else {
                const accountId = decoded.account_id;
                const player = this.worldHandler.createPlayer(accountId, client);
                // currently all entities are networked so this only needs to be sent when first player joins
                if(this.worldHandler.players.size == 1) {
                    this.world.entities.forEach((entity) => {
                        player.actionSender.createEntity(entity);
                    });             
                }
            }
        });
    }

    onLeave (client : Client) {
        const player = this.worldHandler.players[client.sessionId];
        if(player) {
            this.worldHandler.removePlayer(client.sessionId);
        }
    }

    onDispose () {
        this.worldHandler.destroy();
    }

}