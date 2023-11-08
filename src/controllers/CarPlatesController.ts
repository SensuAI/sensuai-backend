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
        this.router.post("/register", this.registerManyCarPlates.bind(this));
        this.router.post("/registerOne", this.registerCarPlate.bind(this));
        this.router.get("/getAll", this.getAllCarPlates.bind(this));
        this.router.get("/:plate", this.getCarPlate.bind(this));
        this.router.post("/assignUser", this.assignUser.bind(this));
    }

    /* Routes Methods */
    private async registerManyCarPlates(req: Request, res: Response): Promise<void> {
        try {
            const carPlates: Array<ICarPlate> = req.body.plates
            let resultCarPlates: Array<ICarPlate> = [];
            for (const carPlate of carPlates) {
                const newCarPlate: HydratedDocument<ICarPlate> = await this._model.create(
                    new CarPlateModel({
                        ...carPlate
                    })
                );
                resultCarPlates.push(newCarPlate);
            }

            res.status(200).send({
                status: "Success",
                message: "Car plates created",
                results: resultCarPlates.length,
                data: {
                    carPlates: resultCarPlates
                }
            })
        } catch (errorMessage) {
            res.status(400).send({
                status: "Fail",
                message: errorMessage
            });
        }
    }

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
            const carPlates: Array<ICarPlate> = await this._model.find({})
                .populate("transactions");
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

    private async getCarPlate(req: Request, res: Response): Promise<void> {
        try {
            const carPlate: HydratedDocument<ICarPlate> | null = await this._model.findOne({
                plate: req.params.plate
            }).populate("transactions");
            if (!carPlate) throw "Car plate does not exist";

            res.status(200).send({
                status: "Success",
                data: {
                    carPlate: carPlate
                }
            });
        } catch (errorMessage) {
            res.status(400).send({
                status: "Fail",
                message: errorMessage
            });
        }
    }

    private async assignUser(req: Request, res: Response): Promise<void> {
        try {
            const carPlate: HydratedDocument<ICarPlate> | null = await this._model.findOne({
                plate: req.body.plate
            });
            if (!carPlate) throw "Car plate does not exist";

            const newCarPlate: HydratedDocument<ICarPlate> | null = await this._model
                .findByIdAndUpdate(
                    carPlate._id,
                    { $set: { username: req.body.username } },
                    { new: true }
                );

            res.status(200).send({
                status: "Success",
                message: "User assigned",
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

}

export default CarPlatesController;
