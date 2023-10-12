import { Schema, model, Types } from 'mongoose';

export interface IBranch {
    name: string;
    state: string;
    city: string;
    street: string;
    postal_code: string;
    phone: string;
    id_manager: Types.ObjectId;
};

export const BranchSchema = new Schema<IBranch>({
    name: {type: String, required: true},
    state: {type: String, required: true},
    city: {type: String, required: true},
    street: {type: String, required: true},
    postal_code: {type: String, required: true},
    phone: {type: String, required: true},
    id_manager: {type: Schema.Types.ObjectId, required: true, ref: 'User' },
});

export const BranchModel = model<IBranch>("Branch", BranchSchema);