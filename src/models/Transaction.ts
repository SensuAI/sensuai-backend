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
    plate: string;
    timestamp: Date;
    duration_minutes_transaction: number;
    payment_method: "Cash" | "CreditCard" | "DebitCard";
    amount: number;
    gas_type: "Regular" | "Premium" | "Diesel";
    gas_quantity: number;
    additional_services?: boolean;
};

export const TransactionSchema = new Schema<ITransaction>({
    branch_id : {type: Schema.Types.ObjectId, required: true, ref: 'Branch' },
    plate: {type: String, required: true},
    timestamp: {type: Date, required: true, default: Date.now},
    duration_minutes_transaction: {type: Number, required: false},
    payment_method: {type: String, enum: ["Cash", "CreditCard", "DebitCard"], required: true},
    amount: {type: Number, required: true},
    gas_type: {type: String, enum: ["Regular", "Premium", "Diesel"], required: true},
    gas_quantity: {type: Number, required: true},
    additional_services: {type: Boolean, required: false}
});

export const TransactionModel = model<ITransaction>("Transaction", TransactionSchema);