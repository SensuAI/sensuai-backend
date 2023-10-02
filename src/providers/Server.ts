import express, { Request, Response, NextFunction } from 'express';
import AbstractController from '../controllers/AbstractController';
import mongoose from 'mongoose';

class Server {

    //Atributos de la clase
    private _app: express.Application;
    private port: number;
    private env: string;
    private _server: any;

    //Métodos constructores
    constructor(appInit: {
        port: number;
        middlewares: any[];
        controllers: AbstractController[];
        env: string;
    }) {
        this._app = express();
        this.port = appInit.port;
        this.env = appInit.env;
        this.loadMiddlewares(appInit.middlewares);
        this.routes(appInit.controllers);
    }

    //Cargar los middlewares
    private loadMiddlewares(middlewares: any): void {
        middlewares.forEach((middleware: any) => {
            this._app.use(middleware)
        })
    }

    private routes(controllers: AbstractController[]): void {
        //Ruta auxiliar para verificar el funcionamiento de la app
        this._app.get('/', (_: any, res: Response) =>
            res.status(200).send({
                message: "The backend module is working",
                documentation: 'http://github.com'
            })
        )
        //Agregar controladores
        controllers.forEach((controller: AbstractController) => {
            this._app.use(`/${controller.prefix}`, controller.router);
        })

    }

    //Agregar la conexión a la base de datos
    public databaseConnect(mongodbUri: string): void {
        mongoose
            .connect(mongodbUri, {})
            .then(() => {
                console.log("Successfully connected to MongoDB");
                console.log(`MongoDB URI: ${mongodbUri}`); 
            })
            .catch((e) => {
                console.log(e);
            });
    }

    // Disconnect from the database
    public databaseDisconnect(): void {
        mongoose.disconnect().then(() => { });
    }

    public async init() {
        this._server = this._app.listen(this.port, () => {
            console.log(`Server:Running @'http://localhost:${this.port}'`);
        })
    }

    // Get the app
    public get app(): express.Application {
        return this._app;
    }

    // Stop the server
    public async close(): Promise<void> {
        if (this._server) {
            await new Promise((resolve, reject) => {
                this._server?.close((err: any) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(true);
                });
            });
        }
    }
}

export default Server;