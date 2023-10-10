import { Schema, model, Types } from 'mongoose';

export interface ITransaction {
    branch_id: Types.ObjectId;
    timestamp: Date;
    duration_minutes_transaction: number;
};

export const TransactionSchema = new Schema<ITransaction>({
    branch_id : {type: Schema.Types.ObjectId, required: true, ref: 'Branch' },
    timestamp: {type: Date, required: true, default: Date.now},
    duration_minutes_transaction: {type: Number, required: false},
});

export interface ICarPlate {
    plate: string;
    username: string;
    transactions?: Types.DocumentArray<ITransaction>
};

export const CarPlateSchema = new Schema<ICarPlate>({
    plate: {type: String, required: true},
    username: {type: String, required: false},
    transactions: {type: [TransactionSchema], default: [], required:false},
});

export const CarPlateModel = model<ICarPlate>("CarPlate", CarPlateSchema);