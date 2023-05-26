import config from "@colyseus/tools";
import { monitor } from "@colyseus/monitor";
import path from 'path';
import serveIndex from 'serve-index';
import express from 'express';

import { RoomHandler } from "./engine/room-handler";
var mysql = require('mysql');

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

        // HTTP - Protocol
        // HTML - Markup
        // Javascript - Scripting language (Frontend)

        // GET REQUEST - whenver you want to get information from the server
        // POST REQUEST - whenver you want to update information on the server
        // DELETE, PATCH, PUT.. etc 

        var con = mysql.createConnection({
            host: "localhost",
            user: "db_user",
            password: "db_user_pass",
            database: "app_db"
        });
          
        con.connect(function(err) {
        if (err) throw err;
            console.log("Connected!");
        });

        app.use('/', serveIndex(path.join(__dirname, "static"), {'icons': true}))
        app.use('/', express.static(path.join(__dirname, "static")));

        app.use('/test', (req, res) => {
            let dbQuery = "INSERT INTO `users` (`id`, `first_name`, `last_name`, `phone_no`, `age`, `email`) VALUES (NULL, 'John', 'Doe', '0123456789', '18', 'johndoe@gmail.com');"
            con.query(dbQuery, function (err, result) {
                if (err) throw err;
                console.log("Result: " + result);
            });
            res.send('success')
        });

        app.use('/calc', (req, res) => {
            let first = req.query.first;
            let second = req.query.second;
            let firstNo : number =  parseInt(first.toString());
            let secondNo : number =  parseInt(second.toString());
            let total = firstNo + secondNo;
            res.send('total: ' + (total))
        });

        app.use('/addStudent', (req, res) => {

            let number = req.query.number;
            let mail = req.query.mail;
            let name = req.query.name;
            let surname = req.query.surname;

            // http://localhost:2567/addStudent?number=1&name=test&mail=test@gmail.com&surname=test

            if(!number || !mail || !name || !surname) {
                res.json({
                    "success": false,
                    "message": "Something went wrong ",
                }) // only allowed once
                return;
            }

            res.json({
                "number": number,
                "mail": mail,
                "name": name,
                "surname": surname
            }) // only allowed once
        
            
        });

        
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
