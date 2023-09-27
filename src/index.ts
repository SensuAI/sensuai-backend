import Server from "./providers/Server";
import { PORT,NODE_ENV, MONGODB_URI } from "./config";
import express from 'express';
import cors from 'cors';

const app = new Server({
    port:PORT,
    middlewares:[
        express.json(),
        express.urlencoded({extended:true}),
        cors()
    ],
    controllers:[
    ],
    env:NODE_ENV
});

declare global{
    namespace Express{
        interface Request{
            user:string;
            token:string;
        }
    }
}

app.databaseConnect(MONGODB_URI);
app.init();
