import Server from "./providers/Server";
import { PORT,NODE_ENV, MONGODB_URI } from "./config";
import express from 'express';
import cors from 'cors';
import UserController from "./controllers/UserController";
import BranchController from "./controllers/BranchController";
import CarPlatesController from "./controllers/CarPlatesController";
import TransactionController from "./controllers/TransactionController";
import ComputerVisionController from "./controllers/ComputerVisionModel";
import StatisticsController from "./controllers/StatisticsController";

const app = new Server({
    port:PORT,
    middlewares:[
        express.json(),
        express.urlencoded({extended:true}),
        cors()
    ],
    controllers:[
        UserController.getInstance(),
        BranchController.getInstance(),
        CarPlatesController.getInstance(),
        TransactionController.getInstance(),
        ComputerVisionController.getInstance(),
        StatisticsController.getInstance()
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
