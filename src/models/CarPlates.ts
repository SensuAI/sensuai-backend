import { Schema, model } from 'mongoose';

export interface ICarPlate {
    plate: string;
};

export const CarPlateSchema = new Schema<ICarPlate>({
    plate: {type: String, required: true},
});

export const CarPlateModel = model<ICarPlate>("CarPlate", CarPlateSchema);