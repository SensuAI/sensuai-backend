import { Request, Response } from "express";
import AbstractController from "./AbstractController";
import { HydratedDocument, Model } from "mongoose";
import { IUser, UserModel } from "../models/User";
// Models

class UserController extends AbstractController {
    /* Attributes */
    private static instance: UserController;
    private readonly _model: Model<IUser> = UserModel;

    // Singleton
    public static getInstance(): AbstractController {
        if (!this.instance) {
            this.instance = new UserController("user");
        }
        return this.instance;
    }

    /* Routes definition and configuration */
    protected initRoutes(): void {
        this.router.post("/signup", this.signup.bind(this));
        this.router.post("/login", this.login.bind(this));
    }

    /* Routes Methods */
    private async signup(req: Request, res: Response): Promise<void> {
        try {
            // Verify if the email is already in use
            const user: HydratedDocument<IUser> | null =
                await this._model.findOne({
                    email: req.body.email
                });
            if (user) throw "The email is already in use";
            const newUser: HydratedDocument<IUser> = await this._model.create(
                new UserModel({
                    ...req.body
                })
            );
            res.status(200).send({
                status: "Success",
                message: "User created"
            });
        } catch (errorMessage) {
            res.status(400).send({
                status: "Fail",
                message: errorMessage,
            });
        }
    }

    private async login(req: Request, res: Response): Promise<void> {
        try {
            const user: HydratedDocument<IUser> | null =
                await this._model.findOne({
                    email: req.body.email,
                    password: req.body.password
                });
            if (!user) throw "Incorrect email/password";

            res.status(200).send({
                status: "Success",
                message: "The user was found"
            });
        } catch (errorMessage) {
            res.status(400).send({
                status: "Fail",
                message: errorMessage,
            });
        }
    }
}

export default UserController;
