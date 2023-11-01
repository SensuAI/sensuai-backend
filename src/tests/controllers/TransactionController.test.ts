import { ICarPlate } from "../../models/CarPlates";
import { GasTypes, ITransaction, PaymentMethods } from "../../models/Transaction";
import { Roles } from "../../models/User";

describe("CreateTransactionTest", () => {
    const user = {
        first_name: "first name",
        last_name: "last name",
        email: "user@oxxogas.com",
        password: "ciscocompa55",
        role: Roles.MANAGER
    };

    const branch = {
        name: "My branch",
        state: "Mexico",
        city: "Atizapan",
        street: "Street",
        postal_code: "55555",
        phone: "1111111111"
    };

    const plate = {
        plate: "abc-123"
    };

    const transaction1 = {
        plate: plate.plate,
        duration_minutes_transaction: 5,
        payment_method: PaymentMethods.Cash,
        amount: 255.5,
        gas_type: GasTypes.Regular,
        gas_quantity: 11.61,
        additional_services: false
    };

    const transaction2 = {
        plate: plate.plate,
        duration_minutes_transaction: 10,
        payment_method: PaymentMethods.CreditCard,
        amount: 500,
        gas_type: GasTypes.Regular,
        gas_quantity: 20,
        additional_services: false
    };

    it("SuccessOne", async () => {
        // Create manager
        await testRequest.post("/user/signup").send(user);
        const signinResult = await testRequest.post("/user/signin").send({
            email: user.email,
            password: user.password
        });

        // Create branch
        const idManager = signinResult.body.data.user._id;
        const branchCreateResult = await testRequest.post("/branch/create").send({
            ...branch,
            id_manager: idManager
        });
        const idBranch = branchCreateResult.body.data.branch._id;

        // Create car
        await testRequest.post("/plate/registerOne").send(plate);

        const result = await testRequest.post("/transaction/register").send({
            ...transaction1,
            branch_id: idBranch,
        });

        expect(result.status).toEqual(200);
        expect(result.body.status).toEqual("Success");
        expect(result.body.message).toEqual("Transaction created");
        expect(result.body.data).toHaveProperty("transaction");

        const resultTransaction = result.body.data.transaction;

        // Transaction id must exist in the transaction list of the plate
        const resultGetPlate = await testRequest.get(`/plate/${plate.plate}`);
        const resultPlate = resultGetPlate.body.data.carPlate;
        expect(resultPlate).toHaveProperty("transactions");
        expect(resultPlate.transactions.length).toEqual(1);
        expect(resultPlate.transactions[0]._id).toEqual(resultTransaction._id);
    });
    it("PlateDoesNotExistSuccess", async () => {
        // Create manager
        await testRequest.post("/user/signup").send(user);
        const signinResult = await testRequest.post("/user/signin").send({
            email: user.email,
            password: user.password
        });

        // Create branch
        const idManager = signinResult.body.data.user._id;
        const branchCreateResult = await testRequest.post("/branch/create").send({
            ...branch,
            id_manager: idManager
        });
        const idBranch = branchCreateResult.body.data.branch._id;

        const result = await testRequest.post("/transaction/register").send({
            ...transaction1,
            branch_id: idBranch,
            plate: "DOES-NOT-EXIST"
        });

        expect(result.status).toEqual(200);
        expect(result.body.status).toEqual("Success");
        expect(result.body.data).toHaveProperty("transaction");

        const resultTransaction = result.body.data.transaction;
        
        // Unexisting plate must have been created
        // Transaction id must exist in the transaction list of the plate
        const resultGetPlate = await testRequest.get(`/plate/${"DOES-NOT-EXIST"}`);
        const resultPlate = resultGetPlate.body.data.carPlate;
        expect(resultPlate).toHaveProperty("transactions");
        expect(resultPlate.transactions.length).toEqual(1);
        expect(resultPlate.transactions[0]._id).toEqual(resultTransaction._id);
    });
    it("SuccessMany", async () => {
        // Create manager
        await testRequest.post("/user/signup").send(user);
        const signinResult = await testRequest.post("/user/signin").send({
            email: user.email,
            password: user.password
        });

        // Create branch
        const idManager = signinResult.body.data.user._id;
        const branchCreateResult = await testRequest.post("/branch/create").send({
            ...branch,
            id_manager: idManager
        });
        const idBranch = branchCreateResult.body.data.branch._id;

        // Create car
        await testRequest.post("/plate/registerOne").send(plate);

        const result = await testRequest.post("/transaction/registerMany").send({
            transactions: [
                {
                    ...transaction1,
                    branch_id: idBranch,
                },
                {
                    ...transaction2,
                    branch_id: idBranch
                }
            ]
        });

        expect(result.status).toEqual(200);
        expect(result.body.status).toEqual("Success");
        expect(result.body.message).toEqual("Transactions created");
        expect(result.body.results).toEqual(2);
        expect(result.body).toHaveProperty("data.transactions");
        const transactions: Array<ITransaction> = result.body.data.transactions;
        // Contains both car transactions
        expect(transactions.some(
            transaction => transaction.plate === transaction1.plate)).toBe(true);
        expect(transactions.some(
            transaction => transaction.plate === transaction2.plate)).toBe(true);
    });
    it("FailureMany", async () => {
        // Create manager
        await testRequest.post("/user/signup").send(user);
        const signinResult = await testRequest.post("/user/signin").send({
            email: user.email,
            password: user.password
        });

        // Create branch
        const idManager = signinResult.body.data.user._id;
        const branchCreateResult = await testRequest.post("/branch/create").send({
            ...branch,
            id_manager: idManager
        });
        const idBranch = branchCreateResult.body.data.branch._id;

        // Create car
        await testRequest.post("/plate/registerOne").send(plate);

        const result = await testRequest.post("/transaction/registerMany").send({
            transactions: [
                {
                    ...transaction1,
                    branch_id: idBranch,
                },
                {
                    ...transaction2,
                    plate: "DOES-NOT-EXIST",
                    branch_id: idBranch
                }
            ]
            
        });

        expect(result.status).toEqual(400);
        expect(result.body.status).toEqual("Fail");
        expect(result.body.message).toEqual("Some plate does not exist");
    });
});

describe("GetAllTransactionsTest", () => {
    const user = {
        first_name: "first name",
        last_name: "last name",
        email: "user@oxxogas.com",
        password: "ciscocompa55",
        role: Roles.MANAGER
    };

    const branch = {
        name: "My branch",
        state: "Mexico",
        city: "Atizapan",
        street: "Street",
        postal_code: "55555",
        phone: "1111111111"
    };

    const plate = {
        plate: "abc-123"
    };

    const transaction1 = {
        plate: plate.plate,
        duration_minutes_transaction: 5,
        payment_method: PaymentMethods.Cash,
        amount: 255.5,
        gas_type: GasTypes.Regular,
        gas_quantity: 11.61,
        additional_services: false
    };

    const transaction2 = {
        plate: plate.plate,
        duration_minutes_transaction: 10,
        payment_method: PaymentMethods.CreditCard,
        amount: 500,
        gas_type: GasTypes.Regular,
        gas_quantity: 20,
        additional_services: false
    };

    it("Success", async () => {
        // Create manager
        await testRequest.post("/user/signup").send(user);
        const signinResult = await testRequest.post("/user/signin").send({
            email: user.email,
            password: user.password
        });

        // Create branch
        const idManager = signinResult.body.data.user._id;
        const branchCreateResult = await testRequest.post("/branch/create").send({
            ...branch,
            id_manager: idManager
        });
        const idBranch = branchCreateResult.body.data.branch._id;

        // Create car
        await testRequest.post("/plate/registerOne").send(plate);

        // Create transactions
        await testRequest.post("/transaction/registerMany").send({
            transactions: [
                {
                    ...transaction1,
                    branch_id: idBranch,
                },
                {
                    ...transaction2,
                    branch_id: idBranch
                }
            ]
        });

        const result = await testRequest.get("/transaction/getAll");
        expect(result.status).toEqual(200);
        expect(result.body.status).toEqual("Success");
        expect(result.body.results).toEqual(2);

        expect(result.body).toHaveProperty("data.transactions");
        const transactions: Array<ICarPlate> = result.body.data.transactions;
        expect(transactions.length).toEqual(2);
        // Contains both car transactions
        expect(transactions.some(
            transaction => transaction.plate === transaction1.plate)).toBe(true);
        expect(transactions.some(
            transaction => transaction.plate === transaction2.plate)).toBe(true);
    });
});

describe("PopulateCarPlatesTest", () => {
    const user = {
        first_name: "first name",
        last_name: "last name",
        email: "user@oxxogas.com",
        password: "ciscocompa55",
        role: Roles.MANAGER
    };

    const branch = {
        name: "My branch",
        state: "Mexico",
        city: "Atizapan",
        street: "Street",
        postal_code: "55555",
        phone: "1111111111"
    };

    const plate = {
        plate: "abc-123"
    };

    const plate2 = {
        plate: "def-456"
    }

    const transaction1 = {
        plate: plate.plate,
        duration_minutes_transaction: 5,
        payment_method: PaymentMethods.Cash,
        amount: 255.5,
        gas_type: GasTypes.Regular,
        gas_quantity: 11.61,
        additional_services: false
    };

    const transaction2 = {
        plate: plate.plate,
        duration_minutes_transaction: 10,
        payment_method: PaymentMethods.CreditCard,
        amount: 500,
        gas_type: GasTypes.Regular,
        gas_quantity: 20,
        additional_services: false
    };

    const transaction3 = {
        plate: plate2.plate,
        duration_minutes_transaction: 10,
        payment_method: PaymentMethods.CreditCard,
        amount: 400,
        gas_type: GasTypes.Regular,
        gas_quantity: 16,
        additional_services: false
    };

    it("GetOneCarPlateSuccess", async () => {
        // Create manager
        await testRequest.post("/user/signup").send(user);
        const signinResult = await testRequest.post("/user/signin").send({
            email: user.email,
            password: user.password
        });

        // Create branch
        const idManager = signinResult.body.data.user._id;
        const branchCreateResult = await testRequest.post("/branch/create").send({
            ...branch,
            id_manager: idManager
        });
        const idBranch = branchCreateResult.body.data.branch._id;

        // Create car
        await testRequest.post("/plate/registerOne").send(plate);

        // Create transactions
        await testRequest.post("/transaction/registerMany").send({
            transactions: [
                {
                    ...transaction1,
                    branch_id: idBranch,
                },
                {
                    ...transaction2,
                    branch_id: idBranch
                },
            ]
        });

        const result = await testRequest.get(`/plate/${plate.plate}`);
        expect(result.status).toEqual(200);
        expect(result.body.status).toEqual("Success");
        const transactions: Array<ICarPlate> = result.body.data.carPlate.transactions;
        expect(transactions.length).toEqual(2);
        // Contains both car transactions
        expect(transactions.some(
            transaction => transaction.plate === transaction1.plate)).toBe(true);
        expect(transactions.some(
            transaction => transaction.plate === transaction2.plate)).toBe(true);
    });
    it("GetAllCarPlatesSuccess", async() => {
        // Create manager
        await testRequest.post("/user/signup").send(user);
        const signinResult = await testRequest.post("/user/signin").send({
            email: user.email,
            password: user.password
        });

        // Create branch
        const idManager = signinResult.body.data.user._id;
        const branchCreateResult = await testRequest.post("/branch/create").send({
            ...branch,
            id_manager: idManager
        });
        const idBranch = branchCreateResult.body.data.branch._id;

        // Create car
        await testRequest.post("/plate/register").send({
            plates: [
                plate,
                plate2
            ]
        });

        // Create transactions
        await testRequest.post("/transaction/registerMany").send({
            transactions: [
                {
                    ...transaction1,
                    branch_id: idBranch,
                },
                {
                    ...transaction3,
                    branch_id: idBranch
                }
            ]
        });

        const result = await testRequest.get(`/plate/getAll`);
        expect(result.status).toEqual(200);
        expect(result.body.status).toEqual("Success");
        const carPlates = result.body.data.carPlates;
        expect(carPlates.length).toEqual(2);
        // Contains both plates, each one with their corresponding transactions
        // The transactions must have been populated
        expect(carPlates.some(
            (carPlate: any) => {
                if (carPlate.plate === plate.plate) {
                    // Transactions must not be an object id, but rather a document
                    return carPlate.transactions[0].plate == plate.plate;
                } else {
                    return false;
                }
            })).toBe(true);
        expect(carPlates.some(
            (carPlate: any) => {
                if (carPlate.plate === plate2.plate) {
                    // Transactions must not be an object id, but rather a document
                    return carPlate.transactions[0].plate == plate2.plate;
                } else {
                    return false;
                }
            })).toBe(true);
    });
});