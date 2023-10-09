describe("SignupTest", () => {
    const user = {
        first_name: "first name",
        last_name: "last name",
        email: "user@oxxogas.com",
        password: "ciscocompa55",
        role: "ADMIN"
    };

    it("Success", async () => {
        const result = await testRequest.post("/user/signup").send(user);
        expect(result.status).toEqual(200);
        expect(result.body.status).toEqual("Success");
        expect(result.body.message).toEqual("User created");
    });

    it("ExistentEmailFailure", async () => {
        // Create the user for the first time
        const result = await testRequest.post("/user/signup").send(user);
        expect(result.status).toEqual(200);
        expect(result.body.status).toEqual("Success");
        expect(result.body.message).toEqual("User created");

        // Attemps to create the user again (rejected by same email)
        const result2 = await testRequest.post("/user/signup").send(user);
        expect(result2.status).toEqual(400);
        expect(result2.body.status).toEqual("Fail");
        expect(result2.body.message).toEqual("The email is already in use");
    });
});

describe("LoginTest", () => {
    const user = {
        first_name: "first name",
        last_name: "last name",
        email: "user@oxxogas.com",
        password: "ciscocompa55",
        role: "ADMIN"
    };

    it("Success", async () => {
        // Create the user
        await testRequest.post("/user/signup").send(user);
        const result = await testRequest.post("/user/signin").send({
            email: user.email,
            password: user.password
        });
        expect(result.status).toEqual(200);
        expect(result.body.status).toEqual("Success");
        expect(result.body.message).toEqual("The user was found");
    });
    
    it("IncorrectEmailFailure", async () => {
        // Create the user
        await testRequest.post("/user/signin").send(user);
        const result = await testRequest.post("/user/signin").send({
            email: "incorrect@email.com",
            password: user.password
        });
        expect(result.status).toEqual(400);
        expect(result.body.status).toEqual("Fail");
        expect(result.body.message).toEqual("Incorrect email/password");
    });

    it("IncorrectPasswordFailure", async () => {
        // Create the user
        await testRequest.post("/user/signup").send(user);
        const result = await testRequest.post("/user/signin").send({
            email: user.email,
            password: "IncorrectPassword"
        });
        expect(result.status).toEqual(400);
        expect(result.body.status).toEqual("Fail");
        expect(result.body.message).toEqual("Incorrect email/password");
    });
});