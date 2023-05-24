import { createWorld } from 'bitecs'
import { Room, Client } from "colyseus";
import { Entity, Vector3 } from "../model/entity";
import jwt from 'jsonwebtoken';
import fs from 'fs';
import { HubsWorld, WorldHandler } from './world-handler';
import MessageHandler from './message-handler';

const publicKey = fs.readFileSync('priv/reticulum.key');

export class RoomHandler extends Room<WorldHandler> {

    maxClients = 25;

    world: HubsWorld = null;
    worldHandler: WorldHandler = null;
    messageHandler : MessageHandler = null;

    constructor() {
        super();
        this.world = createWorld();
        this.world.entities = new Map<number, Entity>;
        this.worldHandler = new WorldHandler(this.world)
        this.messageHandler = new MessageHandler(this.worldHandler);
        this.worldHandler.load();
    }

    onCreate (options : any) {

        let elapsedTime = 0;
        let tickRate = 500;

        this.setState(this.worldHandler);
        
        this.onMessage("onEntityClicked", (client, data) => this.messageHandler.onEntityClicked(client, data))
        this.onMessage("onEntityHoverEntered", (client, data) => this.messageHandler.onEntityHoverEntered(client, data))
        this.onMessage("onEntityHoverExit", (client, data) => this.messageHandler.onEntityHoverExit(client, data))
        this.onMessage("updatePosition", (client, data) => this.messageHandler.onPositionUpdate(client, data));

        this.setSimulationInterval((deltaTime) => {
            elapsedTime += deltaTime;
            while (elapsedTime >= tickRate) {
                elapsedTime -= tickRate;
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