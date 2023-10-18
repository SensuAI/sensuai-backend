import { Schema, model, Types } from 'mongoose';
import { ITransaction, TransactionSchema } from './Transaction';

export interface ICarPlate {
    plate: string;
    username: string;
    first_time_registered: Date;
    transactions?: Types.DocumentArray<Types.ObjectId>
};

export const CarPlateSchema = new Schema<ICarPlate>({
    plate: {type: String, required: true},
    username: {type: String, required: false},
    first_time_registered: {type: Date, required: true, default: Date.now},
    transactions: {type: [Types.ObjectId], default: [], ref: "Transaction"},
});

export const CarPlateModel = model<ICarPlate>("CarPlate", CarPlateSchema);