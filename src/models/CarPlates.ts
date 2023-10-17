import { Schema, model, Types } from 'mongoose';

export enum GasTypes {
    Regular = "Regular",
    Premium = "Premium",
    Diesel = "Diesel"
};

export enum PaymentMethods {
    Cash = "Cash",
    CreditCard = "CreditCard",
    DebitCard = "DebitCard"
};

export interface ITransaction {
    branch_id: Types.ObjectId;
    timestamp: Date;
    duration_minutes_transaction: number;
    pyment_method: "Cash" | "CreditCard" | "DebitCard";
    amount: number;
    gas_type: "Regular" | "Premium" | "Diesel";
    gas_quantity: number;
    additional_services?: boolean;
};

export const TransactionSchema = new Schema<ITransaction>({
    branch_id : {type: Schema.Types.ObjectId, required: true, ref: 'Branch' },
    timestamp: {type: Date, required: true, default: Date.now},
    duration_minutes_transaction: {type: Number, required: false},
    pyment_method: {type: String, enum: ["Cash", "CreditCard", "DebitCard"], required: true},
    amount: {type: Number, required: true},
    gas_type: {type: String, enum: ["Regular", "Premium", "Diesel"], required: true},
    gas_quantity: {type: Number, required: true},
    additional_services: {type: Boolean, required: false}
});

export interface ICarPlate {
    plate: string;
    username: string;
    first_time_registered: Date;
    transactions?: Types.DocumentArray<ITransaction>
};

export const CarPlateSchema = new Schema<ICarPlate>({
    plate: {type: String, required: true},
    username: {type: String, required: false},
    first_time_registered: {type: Date, required: true, default: Date.now},
    transactions: {type: [TransactionSchema], default: [], required:false},
});

export const CarPlateModel = model<ICarPlate>("CarPlate", CarPlateSchema);