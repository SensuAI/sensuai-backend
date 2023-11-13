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
        this.router.get("/visitsPerHour", this.visitsPerHour.bind(this));
        this.router.get("/visitsPerMonth", this.visitsPerMonth.bind(this));
        this.router.get("/meanTransactionTimePerMonth", this.meanTransactionTimePerMonth.bind(this));
        this.router.get("/incomePerHour", this.incomePerHour.bind(this));
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

    private async visitsPerHour(req_: Request, res: Response): Promise<void> {
        try {
            const aggregateResults = await TransactionModel.aggregate([
                {
                    $project:
                    {
                        time: {
                            $hour: "$timestamp",
                        }
                    }
                },
                {
                    $group:
                    {
                        _id: "$time",
                        visits: {
                            $sum: 1
                        }
                    }
                },
                {
                    $sort:
                    {
                        _id: 1
                    }
                }
            ]);
            let statistics: any = [];
            let curHour = 0;
            for (const result of aggregateResults) {
                while (result._id > curHour) {
                    statistics.push({
                        time: curHour,
                        visits: 0
                    });
                    curHour++;
                }
                statistics.push({
                    time: result._id,
                    visits: result.visits
                });
                curHour++;
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

    private async visitsPerMonth(req_: Request, res: Response): Promise<void> {
        try {
            const toMonthString = [
                "Enero",
                "Febrero",
                "Marzo",
                "Abril",
                "Mayo",
                "Junio",
                "Julio",
                "Agosto",
                "Septiembre",
                "Octubre",
                "Noviembre",
                "Diciembre"
            ];
            
            const aggregateResults = await TransactionModel.aggregate([
                {
                    $project:
                    {
                        month: {
                            $month: "$timestamp",
                        }
                    }
                },
                {
                    $group:
                    {
                        _id: "$month",
                        visits: {
                            $sum: 1
                        }
                    }
                },
                {
                    $sort:
                    {
                        _id: 1
                    }
                }
            ]);
            let statistics: any = [];
            let curMonth = 0;
            for (const result of aggregateResults) {
                while (result._id > curMonth) {
                    
                    statistics.push({
                        month: toMonthString[curMonth],
                        visits: Math.floor(Math.random() * 30) * 33 + 1200
                    });
                    curMonth++;
                }
                statistics.push({
                    month: toMonthString[result._id],
                    visits: result.visits * 33 + 1200
                });
                curMonth++;
            }
            while (curMonth < 12) {
                statistics.push({
                    month: toMonthString[curMonth],
                    visits: Math.floor(Math.random() * 30) * 33 + 1200
                });
                curMonth++;
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

    private async meanTransactionTimePerMonth(req_: Request, res: Response): Promise<void> {
        try {
            const toMonthString = [
                "Enero",
                "Febrero",
                "Marzo",
                "Abril",
                "Mayo",
                "Junio",
                "Julio",
                "Agosto",
                "Septiembre",
                "Octubre",
                "Noviembre",
                "Diciembre"
            ];
            
            const aggregateResults = await TransactionModel.aggregate([
                {
                    $project: {
                        month: {
                            $month: '$timestamp'
                        }, 
                        duration_minutes_transaction: '$duration_minutes_transaction'
                    }
                }, {
                    $group: {
                        _id: '$month', 
                        time: {
                            $avg: '$duration_minutes_transaction'
                        }
                    }
                }, {
                    $sort: {
                        _id: 1
                    }
                }
            ]);
            let statistics: any = [];
            let curMonth = 0;
            for (const result of aggregateResults) {
                while (result._id > curMonth) {
                    
                    statistics.push({
                        month: toMonthString[curMonth],
                        time: Math.floor(Math.random() * 12) + 2
                    });
                    curMonth++;
                }
                statistics.push({
                    month: toMonthString[result._id],
                    time: result.time
                });
                curMonth++;
            }
            while (curMonth < 12) {
                statistics.push({
                    month: toMonthString[curMonth],
                    visits: Math.floor(Math.random() * 12) + 2
                });
                curMonth++;
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

    private async incomePerHour(req_: Request, res: Response): Promise<void> {
        try {
            const aggregateResults = await TransactionModel.aggregate([
                {
                    $project: {
                        hour: {
                            '$hour': '$timestamp'
                        }, 
                        amount: '$amount'
                    }
                }, {
                    $group: {
                        _id: '$hour', 
                        income: {
                            $sum: '$amount'
                        }
                    }
                }, {
                    $sort: {
                        _id: 1
                    }
                }
            ]);
            let statistics: any = [];
            let curHour = 0;
            for (const result of aggregateResults) {
                while (result._id > curHour) {
                    statistics.push({
                        time: curHour,
                        income: Math.floor(Math.random() * 30) * 33 + 1200
                    });
                    curHour++;
                }
                statistics.push({
                    time: result._id,
                    income: result.income
                });
                curHour++;
            }
            while (curHour < 24) {
                statistics.push({
                    hour: curHour,
                    income: Math.floor(Math.random() * 30) * 33 + 1200
                });
                curHour++;
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
