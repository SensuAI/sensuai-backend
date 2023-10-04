import { Schema, model } from 'mongoose';

export interface IBranch {
    name: string;
    state: string;
    city: string;
    street: string;
    postal_code: string;
    phone: string;
};

export const BranchSchema = new Schema<IBranch>({
    name: {type: String, required: true},
    state: {type: String, required: true},
    city: {type: String, required: true},
    street: {type: String, required: true},
    postal_code: {type: String, required: true},
    phone: {type: String, required: true}
});

export const BranchModel = model<IBranch>("Branch", BranchSchema);