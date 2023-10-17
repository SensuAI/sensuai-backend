import { Request, Response } from "express";
import AbstractController from "./AbstractController";
import { HydratedDocument, Model } from "mongoose";
import bcrypt from "bcryptjs";
import { IUser, Roles, UserModel } from "../models/User";
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

    private async login(email: string, password: string): Promise<IUser | null> {
        const user: HydratedDocument<IUser> | null =
            await this._model.findOne({
                email: email,
            });
        if (!user) return null;

        const passwordOk: boolean = bcrypt.compareSync(
            password, user.hashed_password);

        if (!passwordOk) return null;
        // Get the user data without password
        const userWithoutPassword: HydratedDocument<IUser> | null =
            await this._model.findOne(
                { email: email },
                "-hashed_password"
            );
        return userWithoutPassword;
    }

    /* Routes definition and configuration */
    protected initRoutes(): void {
        this.router.post("/signup", this.signup.bind(this));
        this.router.post("/signupMany", this.signupMany.bind(this));
        this.router.post("/signin", this.signin.bind(this));
        this.router.post("/changePassword", this.changePassword.bind(this));
        this.router.get("/getAllManagers", this.getAllManagers.bind(this));
    }

    /* Routes Methods */
    private async signupMany(req: Request, res: Response): Promise<void> {
        try {
            const users = req.body.users
            let resultUsers: Array<IUser> = [];
            for (const user of users) {
                // Verify if the email is already in use
                const userDocument: HydratedDocument<IUser> | null =
                await this._model.findOne({
                    email: user.email
                });
                if (userDocument) throw "One of the emails is already in use";
            }
            for (const user of users) {
                const password: string = user.password;
                const hashedPassword: string = bcrypt.hashSync(
                    password, bcrypt.genSaltSync());
                const newUser: HydratedDocument<IUser> = await this._model.create(
                    new UserModel({
                        first_name: user.first_name,
                        last_name: user.last_name,
                        email: user.email,
                        hashed_password: hashedPassword,
                        role: user.role
                    })
                );
                resultUsers.push(newUser);
            }

            res.status(200).send({
                status: "Success",
                message: "Users created",
                results: resultUsers.length
            });
        } catch (errorMessage) {
            res.status(400).send({
                status: "Fail",
                message: errorMessage,
            });
        }
    }

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
            const user: IUser | null = await this.login(
                req.body.email, req.body.password);
            if (!user) throw "Incorrect email/password";
            res.status(200).send({
                status: "Success",
                message: "The user was found",
                data: {
                    user: user
                }
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
            const user: IUser | null = await this.login(
                req.body.email, req.body.password);
            if (!user) throw "Incorrect email/password";
            const newPassword: string = req.body.new_password;
            const newHashedPassword: string = bcrypt.hashSync(
                newPassword, bcrypt.genSaltSync());
            const newUser: IUser | null = await this._model.findOneAndUpdate(
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

    private async getAllManagers(_req: Request, res: Response): Promise<void> {
        try {
            const managers: Array<IUser> = await this._model.find(
                { role: Roles.MANAGER },
                "-hashed_password"  // Do not send the hashed password
            );
            res.status(200).send({
                status: "Success",
                results: managers.length,
                data: {
                    managers: managers
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

export default UserController;
