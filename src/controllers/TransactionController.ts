import { Request, Response } from "express";
import AbstractController from "./AbstractController";
import { HydratedDocument, Model } from "mongoose";
import { ITransaction, TransactionModel } from "../models/Transaction";
import { CarPlateModel, ICarPlate } from "../models/CarPlates";

class TransactionController extends AbstractController {
    /* Attributes */
    private static instance: TransactionController;
    private readonly _model: Model<ITransaction> = TransactionModel;

    // Singleton
    public static getInstance(): AbstractController {
        if (!this.instance) {
            this.instance = new TransactionController("transaction");
        }
        return this.instance;
    }

    /* Routes definition and configuration */
    protected initRoutes(): void {
        this.router.post("/register", this.registerTransaction.bind(this));
        this.router.post("/registerMany", this.registerManyTransactions.bind(this));
        this.router.get("/getAll", this.getAllTransactions.bind(this));
    }

    /* Routes Methods */
    private async registerManyTransactions(req: Request, res: Response): Promise<void> {
        try {
            const transactions: Array<ITransaction> = req.body.transactions;
            // Verify plates
            for (const transaction of transactions) {
                const plateId: string = transaction.plate;
                const plate: HydratedDocument<ICarPlate> | null = await CarPlateModel.findOne({
                    plate: plateId
                });
                if (!plate) throw "Some plate does not exist";
            }
            let resultTransactions: Array<ITransaction> = [];
            for (const transaction of transactions) {
                const plateId: string = transaction.plate;
                const plate: HydratedDocument<ICarPlate> | null = await CarPlateModel.findOne({
                    plate: plateId
                });
                if (!plate) throw "Some plate does not exist";

                const newTransaction: HydratedDocument<ITransaction> = await this._model.create(
                    new TransactionModel(transaction)
                );

                // Register the transaction in the corresponding plate
                const newCarPlate: HydratedDocument<ICarPlate> | null = await CarPlateModel
                    .findByIdAndUpdate(
                        plate._id,
                        { $push: { transactions: newTransaction._id } },
                        { new: true }
                    );
                resultTransactions.push(newTransaction);
            }

            res.status(200).send({
                status: "Success",
                message: "Transactions created",
                results: resultTransactions.length,
                data: {
                    transactions: resultTransactions
                }
            })
        } catch (errorMessage) {
            res.status(400).send({
                status: "Fail",
                message: errorMessage
            });
        }
    }

    private async registerTransaction(req: Request, res: Response): Promise<void> {
        try {
            // Verify plate
            const plateId: string = req.body.plate;
            const plate: HydratedDocument<ICarPlate> | null = await CarPlateModel.findOne({
                plate: plateId
            });
            if (!plate) throw "Plate does not exist";

            const transaction: HydratedDocument<ITransaction> = await this._model.create(
                new TransactionModel({
                    ...req.body
                })
            );

            // Register the transaction in the corresponding plate
            const newTransaction: HydratedDocument<ICarPlate> | null = await CarPlateModel
                .findByIdAndUpdate(
                    plate._id,
                    { $push: { transactions: transaction._id } },
                    { new: true }
                );
            res.status(200).send({
                status: "Success",
                message: "Transaction created",
                data: {
                    transaction: transaction
                }
            });
        } catch (errorMessage) {
            res.status(400).send({
                status: "Fail",
                message: errorMessage,
            });
        }
    }

    private async getAllTransactions(_req: Request, res: Response): Promise<void> {
        try {
            const transactions: Array<ITransaction> = await this._model.find({});
            res.status(200).send({
                status: "Success",
                results: transactions.length,
                data: {
                    transactions: transactions
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

export default TransactionController;
