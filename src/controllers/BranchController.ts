import { Request, Response } from "express";
import AbstractController from "./AbstractController";
import mongoose, { HydratedDocument, Model } from "mongoose";
import { BranchModel, IBranch } from "../models/branch";
import { IUser, UserModel } from "../models/User";

class BranchController extends AbstractController {
    /* Attributes */
    private static instance: BranchController;
    private readonly _model: Model<IBranch> = BranchModel;

    // Singleton
    public static getInstance(): AbstractController {
        if (!this.instance) {
            this.instance = new BranchController("branch");
        }
        return this.instance;
    }

    /* Routes definition and configuration */
    protected initRoutes(): void {
        this.router.post("/create", this.createBranch.bind(this));
        this.router.post("/:id/changeManager", this.changeManager.bind(this));
        this.router.get("/getAll", this.getAllBranches.bind(this));
    }

    /* Routes Methods */
    private async createBranch(req: Request, res: Response): Promise<void> {
        try {
            const newBranch: HydratedDocument<IBranch> = await this._model.create(
                new BranchModel({
                    ...req.body
                })
            );

            res.status(200).send({
                status: "Success",
                message: "Branch created",
                data: {
                    branch: newBranch
                }
            });
        } catch (errorMessage) {
            res.status(400).send({
                status: "Fail",
                message: errorMessage,
            });
        }
    }

    private async changeManager(req: Request, res: Response): Promise<void> {
        try {
            const branchId = req.params.id;
            const managerId = req.body.id_manager;
            // Verify manager
            const manager: HydratedDocument<IUser> | null = await UserModel.findById(managerId);
            if (!manager) throw "Manager does not exist";
            const branch: HydratedDocument<IBranch> | null = await this._model
                .findByIdAndUpdate(
                    branchId,
                    { $set: { id_manager: new mongoose.Types.ObjectId(managerId) } },
                    { new: true }
                );
            res.status(200).send({
                status: "Success",
                message: "The manager was changed",
                data: {
                    branch: branch
                }
            });

        } catch (errorMessage) {
            res.status(400).send({
                status: "Fail",
                message: errorMessage
            });
        }
    }

    private async getAllBranches(_req: Request, res: Response): Promise<void> {
        try {
            const branches: Array<IBranch> = await this._model.find({});
            res.status(200).send({
                status: "Success",
                results: branches.length,
                data: {
                    branches: branches
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

export default BranchController;
