import mongoose from "mongoose";
import { Roles } from "../../models/User";
import { IBranch } from "../../models/Branch";

describe("CreateBranchTest", () => {
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

    it("Success", async () => {
        // Create manager
        await testRequest.post("/user/signup").send(user);
        const signinResult = await testRequest.post("/user/signin").send({
            email: user.email,
            password: user.password
        });
        const idManager = signinResult.body.data.user._id;
        // Create branch
        const result = await testRequest.post("/branch/create").send({
            ...branch,
            id_manager: idManager
        });
        expect(result.status).toEqual(200);
        expect(result.body.status).toEqual("Success");
        expect(result.body.message).toEqual("Branch created");
        expect(result.body.data).toHaveProperty("branch");
    });

    it("TryToCreateBranchWithoutManager", async () => {
        const managerObjectId = new mongoose.Types.ObjectId();
        const idManager = managerObjectId.toString();
        // Create branch
        const result = await testRequest.post("/branch/create").send({
            ...branch,
            id_manager: idManager
        });
        expect(result.status).toEqual(400);
        expect(result.body.status).toEqual("Fail");
        expect(result.body.message).toEqual("Manager does not exist");
    });
});

describe("ChangeManagerTest", () => {
    const user = {
        first_name: "first name",
        last_name: "last name",
        email: "user@oxxogas.com",
        password: "ciscocompa55",
        role: Roles.MANAGER
    };
    const user2 = {
        first_name: "first name",
        last_name: "last name",
        email: "user2@oxxogas.com",
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

    it("Success", async () => {
        // Create manager
        await testRequest.post("/user/signup").send(user);
        const signinResult = await testRequest.post("/user/signin").send({
            email: user.email,
            password: user.password
        });
        const idManager = signinResult.body.data.user._id;
        // Crate the branch
        const createBranchResult = await testRequest
            .post("/branch/create").send({
                ...branch,
                id_manager: idManager
            });
        const branchId = createBranchResult.body.data.branch._id;
        // Create the new manager
        await testRequest.post("/user/signup").send(user2);
        const signinResult2 = await testRequest.post("/user/signin").send({
            email: user2.email,
            password: user2.password
        });
        const idNewManager = signinResult.body.data.user._id;
        // Change the manager
        const result = await testRequest
            .post(`/branch/${branchId}/changeManager`).send({
                id_manager: idNewManager
            });
        expect(result.status).toEqual(200);
        expect(result.body.status).toEqual("Success");
        expect(result.body.message).toEqual("The manager was changed");
        expect(result.body.data).toHaveProperty("branch");
        const newBranch = result.body.data.branch;
        expect(newBranch.id_manager).toEqual(idNewManager);
    });

    it("TryToAssignUnexistentManager", async () => {
        // Create manager
        await testRequest.post("/user/signup").send(user);
        const signinResult = await testRequest.post("/user/signin").send({
            email: user.email,
            password: user.password
        });
        const idManager = signinResult.body.data.user._id;
        // Crate the branch
        const createBranchResult = await testRequest
            .post("/branch/create").send({
                ...branch,
                id_manager: idManager
            });
        const branchId = createBranchResult.body.data.branch._id;

        // Id of manager not existent in database
        const managerObjectId = new mongoose.Types.ObjectId();
        const idNewManager = managerObjectId.toString();

        // Change the manager
        const result = await testRequest
            .post(`/branch/${branchId}/changeManager`).send({
                id_manager: idNewManager
            });
        expect(result.status).toEqual(400);
        expect(result.body.status).toEqual("Fail");
        expect(result.body.message).toEqual("Manager does not exist");
    });
});

describe("GetAllBranchesTest", () => {
    const user = {
        first_name: "first name",
        last_name: "last name",
        email: "user@oxxogas.com",
        password: "ciscocompa55",
        role: Roles.MANAGER
    };
    const branch1 = {
        name: "Branch 1",
        state: "Mexico",
        city: "Atizapan",
        street: "Street",
        postal_code: "55555",
        phone: "1111111111"
    };
    const branch2 = {
        name: "Branch 2",
        state: "Mexico",
        city: "Tultitlan",
        street: "Street",
        postal_code: "55555",
        phone: "1111111111"
    };
    it("Success", async () => {
        // Create manager
        await testRequest.post("/user/signup").send(user);
        const signinResult = await testRequest.post("/user/signin").send({
            email: user.email,
            password: user.password
        });
        const idManager = signinResult.body.data.user._id;

        // Create the branches
        await testRequest.post("/branch/create").send({
            ...branch1,
            id_manager: idManager
        });
        await testRequest.post("/branch/create").send({
            ...branch2,
            id_manager: idManager
        });

        const result = await testRequest.get("/branch/getAll");
        expect(result.status).toEqual(200);
        expect(result.body.status).toEqual("Success");
        expect(result.body.results).toEqual(2);

        expect(result.body.data).toHaveProperty("branches");
        const branches: Array<IBranch> = result.body.data.branches;
        expect(branches.length).toEqual(2);

        // Contains both branches
        expect(branches.some(
            branch => branch.name === branch2.name)).toBe(true);
        expect(branches.some(
            branch => branch.name === branch2.name)).toBe(true);
    });
});
