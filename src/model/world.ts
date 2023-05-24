import { IWorld } from "bitecs";
import { Entity } from "./entity";

export interface HubsWorld extends IWorld {

    entities: Map<number, Entity>;
    time: { delta: number; elapsed: number; tick: number };

}