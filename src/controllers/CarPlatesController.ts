import { Request, Response } from "express";
import AbstractController from "./AbstractController";
import { HydratedDocument, Model } from "mongoose";
import { CarPlateModel, ICarPlate } from "../models/CarPlates";

class CarPlatesController extends AbstractController {
    /* Attributes */
    private static instance: CarPlatesController;
    private readonly _model: Model<ICarPlate> = CarPlateModel;

    // Singleton
    public static getInstance(): AbstractController {
        if (!this.instance) {
            this.instance = new CarPlatesController("plate");
        }
        return this.instance;
    }

    /* Routes definition and configuration */
    protected initRoutes(): void {
        this.router.post("/register", this.registerCarPlate.bind(this));
        this.router.get("/getAll", this.getAllCarPlates.bind(this));
    }

    /* Routes Methods */
    private async registerCarPlate(req: Request, res: Response): Promise<void> {
        try {
            const newCarPlate: HydratedDocument<ICarPlate> = await this._model.create(
                new CarPlateModel({
                    plate: req.body.plate,
                })
            );

            res.status(200).send({
                status: "Success",
                message: "Car plate created",
                data: {
                    carPlate: newCarPlate
                }
            });
        } catch (errorMessage) {
            res.status(400).send({
                status: "Fail",
                message: errorMessage,
            });
        }
    }

    private async getAllCarPlates(_req: Request, res: Response): Promise<void> {
        try {
            const carPlates: Array<ICarPlate> = await this._model.find({});
            res.status(200).send({
                status: "Success",
                results: carPlates.length,
                data: {
                    carPlates: carPlates
                }
            });
        } catch (errorMessage) {
            res.status(400).send({
                status: "Fail",
                message: errorMessage
            });
        }
    }
}

export default CarPlatesController;
