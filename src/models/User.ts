import { Schema, model } from "mongoose";

export enum Roles {
    ADMIN = "ADMIN",
    MANAGER = "MANAGER"
};

export interface IUser {
    first_name: string;
    last_name: string;
    email: string;
    hashed_password: string;
    role: "ADMIN" | "MANAGER";
};

export const UserSchema = new Schema<IUser>({
    first_name: {type: String, required: true},
    last_name: {type: String, required: true},
    email: {type: String, required: true},
    hashed_password: {type: String, required: true},
    role: {type: String, enum: ["ADMIN", "MANAGER"]}
});

export const UserModel = model<IUser>("User", UserSchema);
