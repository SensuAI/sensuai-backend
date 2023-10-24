import { PaymentMethods } from "./Transaction";

export interface IPlateStatistics {
    plate: string;
    total_gas_consumption: number;
    transactions_with_additional_services: number;
    total_money_spent: number;
    last_transaction_date: Date;
    last_payment_method_used?: PaymentMethods;
    mean_duration_minutes_per_transaction: number;
};