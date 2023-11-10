import { Request, Response } from "express";
import AbstractController from "./AbstractController";
import { ITransaction, TransactionModel } from "../models/Transaction";

class StatisticsController extends AbstractController {
    /* Attributes */
    private static instance: StatisticsController;

    // Singleton
    public static getInstance(): AbstractController {
        if (!this.instance) {
            this.instance = new StatisticsController("statistics");
        }
        return this.instance;
    }

    /* Routes definition and configuration */
    protected initRoutes(): void {
        this.router.get("/typeOfPaymentCount", this.typeOfPaymentCount.bind(this));
    }

    private async typeOfPaymentCount(req_: Request, res: Response): Promise<void> {
        try {
            const aggregateResults = await TransactionModel.aggregate([
                {
                    $group:
                    {
                        _id: "$payment_method",
                        count: {
                            $sum: 1
                        }
                    }
                }
            ]);
            let statistics: any = [];
            for (const result of aggregateResults) {
                statistics.push({
                    name: result._id,
                    count: result.count
                });
            }
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

export default StatisticsController;
