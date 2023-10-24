import { Request, Response } from "express";
import AbstractController from "./AbstractController";
import { Aggregate, HydratedDocument, Model } from "mongoose";
import { ITransaction, PaymentMethods, TransactionModel } from "../models/Transaction";
import { CarPlateModel, ICarPlate } from "../models/CarPlates";
import { IPlateStatistics } from "../models/PlateStatistics";

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
        this.router.get("/:plate/statistics", this.getPlateStatistics.bind(this));
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

    private async getPlateStatistics(req: Request, res: Response): Promise<void> {
        try {
            const plate: string = req.params.plate;
            const aggregateResult = await this._model.aggregate([
                { $match: { plate: plate } },
                {
                    $group:
                    {
                        _id: "$plate",
                        total_gas_consumption: {
                            $sum: "$gas_quantity"
                        },
                        transactions_with_additional_services: {
                            $sum: {
                                $cond: {
                                    if: {
                                        $eq: ["$additional_services", true]
                                    },
                                    then: 1,
                                    else: 0
                                }
                            }
                        },
                        total_money_spent: {
                            $sum: "$amount"
                        },
                        last_transaction_date: {
                            $max: "$timestamp"
                        },
                        mean_duration_minutes_per_transacction: {
                            $avg: "$duration_minutes_transaction"
                        }
                    }
                }
            ]);
            let statistics: IPlateStatistics = {
                plate: plate,
                total_gas_consumption:
                    aggregateResult[0].total_gas_consumption,
                transactions_with_additional_services:
                    aggregateResult[0].transactions_with_additional_services,
                total_money_spent:
                    aggregateResult[0].total_money_spent,
                last_transaction_date:
                    aggregateResult[0].last_transaction_date,
                mean_duration_minutes_per_transaction:
                    aggregateResult[0].mean_duration_minutes_per_transacction
            };
            res.status(200).send({
                status: "Success",
                data: {
                    statistics: statistics
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
