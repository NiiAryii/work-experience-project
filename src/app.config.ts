import config from "@colyseus/tools";
import { monitor } from "@colyseus/monitor";
import path from 'path';
import serveIndex from 'serve-index';
import express from 'express';

import { RoomHandler } from "./engine/room-handler";

export default config({

    getId: () => "MetaScript Server",

    options: {
        devMode: true,
    },

    initializeGameServer: (gameServer) => {

        gameServer.define("state_handler", RoomHandler)
            .enableRealtimeListing();

        gameServer.onShutdown(function(){
            console.log(`game server is going down.`);
        });

    },

    initializeExpress: (app) => {
        app.use('/', serveIndex(path.join(__dirname, "static"), {'icons': true}))
        app.use('/', express.static(path.join(__dirname, "static")));

        // app.use(serveIndex(path.join(__dirname, "static"), {'icons': true}))
        // app.use(express.static(path.join(__dirname, "static")));

        // (optional) attach web monitoring panel
        app.use('/colyseus', monitor());
    },


    beforeListen: () => {
        /**
         * Before before gameServer.listen() is called.
         */
    }
});
