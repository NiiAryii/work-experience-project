import config from "@colyseus/tools";
import { monitor } from "@colyseus/monitor";
import path from 'path';
import serveIndex from 'serve-index';
import express from 'express';

// import { uWebSocketsTransport} from "@colyseus/uwebsockets-transport";

// Import demo room handlers
import { StateHandlerRoom } from "./rooms/02-state-handler";

export default config({
    getId: () => "Your Colyseus App",

    options: {
        devMode: true,
    },

    // initializeTransport: (options) => new uWebSocketsTransport(options),

    initializeGameServer: (gameServer) => {

        // Define "state_handler" room
        gameServer.define("state_handler", StateHandlerRoom)
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
