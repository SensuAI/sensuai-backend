import { Request, Response } from "express";
import AbstractController from "./AbstractController";
import { HydratedDocument, Model } from "mongoose";
import bcrypt from "bcryptjs";
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

    private async login(email: string, password: string): Promise<boolean> {
        const user: HydratedDocument<IUser> | null =
            await this._model.findOne({
                email: email,
            });
        if (!user) return false;

        const passwordOk: boolean = bcrypt.compareSync(
            password, user.hashed_password);
        return passwordOk;
    }

    /* Routes definition and configuration */
    protected initRoutes(): void {
        this.router.post("/signup", this.signup.bind(this));
        this.router.post("/signin", this.signin.bind(this));
        this.router.post("/changePassword", this.changePassword.bind(this));
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

            const password: string = req.body.password;
            const hashedPassword: string = bcrypt.hashSync(
                password, bcrypt.genSaltSync());
            const newUser: HydratedDocument<IUser> = await this._model.create(
                new UserModel({
                    first_name: req.body.first_name,
                    last_name: req.body.last_name,
                    email: req.body.email,
                    hashed_password: hashedPassword,
                    role: req.body.role
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

    private async signin(req: Request, res: Response): Promise<void> {
        try {
            const loginOk: boolean = await this.login(
                req.body.email, req.body.password);
            if (!loginOk) throw "Incorrect email/password";
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

    private async changePassword(req: Request, res: Response): Promise<void> {
        try {
            const loginOk: boolean = await this.login(
                req.body.email, req.body.password);
            if (!loginOk) throw "Incorrect email/password";
            const newPassword: string = req.body.new_password;
            const newHashedPassword: string = bcrypt.hashSync(
                newPassword, bcrypt.genSaltSync());
            const user: IUser | null = await this._model.findOneAndUpdate(
                { email: req.body.email },
                { $set: { hashed_password: newHashedPassword } },
                { new: true }
            );
            res.status(200).send({
                status: "Success",
                message: "Password changed"
            });
        } catch (errorMessage) {
            res.status(400).send({
                status: "Fail",
                message: errorMessage
            });
        }
    }
}

export default UserController;
