import { Request, Response } from "express";
import AbstractController from "./AbstractController";
import mongoose, { HydratedDocument } from "mongoose";
import { GasTypes, ITransaction, PaymentMethods, TransactionModel } from "../models/Transaction";
import { CarPlateModel, ICarPlate } from "../models/CarPlates";

class ComputerVisionController extends AbstractController {
    /* Attributes */
    private static instance: ComputerVisionController;

    // Singleton
    public static getInstance(): AbstractController {
        if (!this.instance) {
            this.instance = new ComputerVisionController("model");
        }
        return this.instance;
    }

    /* Routes definition and configuration */
    protected initRoutes(): void {
        this.router.post("/plateIdentified", this.registerPlateIdentified.bind(this));
    }

    private async plateIdentified(identificationData: any): Promise<void> {
        // Verify if plate is registered
        const plateId: string = identificationData.plate;
        let plate: HydratedDocument<ICarPlate> | null = await CarPlateModel.findOne({
            plate: plateId
        });
        if (!plate) {
            plate = await CarPlateModel.create(
                new CarPlateModel({ plate: plateId })
            );
        }

        // Create the transaction if the vehicle is associated with an username
        if (plate.username) {
            const liters = Math.random() * 80;
            const newTransaction: HydratedDocument<ITransaction> = await TransactionModel.create(
                new TransactionModel({
                    branch_id: new mongoose.Types.ObjectId(identificationData.branch_id),
                    plate: plateId,
                    duration_minutes_transaction: Math.random() * 10,
                    payment_method: PaymentMethods.Cash,
                    amount: liters * 22.3,
                    gas_type: GasTypes.Regular,
                    gas_quantity: liters,
                    additional_services: false,
                    vehicule_type: "Car"
                })
            );

            // Register the transaction in the corresponding plate
            const newCarPlate: HydratedDocument<ICarPlate> | null = await CarPlateModel
            .findByIdAndUpdate(
                plate._id,
                { $push: { transactions: newTransaction._id } },
                { new: true }
            );
        }
    }

    /* Routes Methods */
    // private async registerManyPlatesIdentified(req: Request, res: Response): Promise<void> {
    //     try {
    //         const transactions: Array<ITransaction> = req.body.transactions;
    //         // Verify plates
    //         for (const transaction of transactions) {
    //             const plateId: string = transaction.plate;
    //             const plate: HydratedDocument<ICarPlate> | null = await CarPlateModel.findOne({
    //                 plate: plateId
    //             });
    //             if (!plate) throw "Some plate does not exist";
    //         }
    //         let resultTransactions: Array<ITransaction> = [];
    //         for (const transaction of transactions) {
    //             const plateId: string = transaction.plate;
    //             const plate: HydratedDocument<ICarPlate> | null = await CarPlateModel.findOne({
    //                 plate: plateId
    //             });
    //             if (!plate) throw "Some plate does not exist";

    //             const newTransaction: HydratedDocument<ITransaction> = await this._model.create(
    //                 new TransactionModel(transaction)
    //             );

    //             // Register the transaction in the corresponding plate
    //             const newCarPlate: HydratedDocument<ICarPlate> | null = await CarPlateModel
    //                 .findByIdAndUpdate(
    //                     plate._id,
    //                     { $push: { transactions: newTransaction._id } },
    //                     { new: true }
    //                 );
    //             resultTransactions.push(newTransaction);
    //         }

    //         res.status(200).send({
    //             status: "Success",
    //             message: "Transactions created",
    //             results: resultTransactions.length,
    //             data: {
    //                 transactions: resultTransactions
    //             }
    //         })
    //     } catch (errorMessage) {
    //         res.status(400).send({
    //             status: "Fail",
    //             message: errorMessage
    //         });
    //     }
    // }

    private async registerPlateIdentified(req: Request, res: Response): Promise<void> {
        try {
            // Verify if plate is registered
            await this.plateIdentified(req.body);
            res.status(200).send({
                status: "Success",
                message: "Plate identified successfuly",
                data: {
                    plate: req.body.plate
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

export default ComputerVisionController;
