import { ICarPlate } from "../../models/CarPlates";

describe("CreateCarPlateTest", () => {
    const plate1 = {
        plate: "abc-123"
    };
    const plate2 = {
        plate: "def-456"
    };

    it("SuccessOne", async () => {
        const result = await testRequest.post("/plate/registerOne").send(plate1);
        expect(result.status).toEqual(200);
        expect(result.body.status).toEqual("Success");
        expect(result.body.message).toEqual("Car plate created");
    });
    it("SuccessMany", async () => {
        const result = await testRequest.post("/plate/register").send({
            plates: [
                plate1,
                plate2
            ]
        });
        expect(result.status).toEqual(200);
        expect(result.body.status).toEqual("Success");
        expect(result.body.message).toEqual("Car plates created");
        expect(result.body.results).toEqual(2);
        expect(result.body).toHaveProperty("data.carPlates");
        const carPlates: Array<ICarPlate> = result.body.data.carPlates;
        // Contains both car plates
        expect(carPlates.some(
            plate => plate.plate === plate1.plate)).toBe(true);
        expect(carPlates.some(
            plate => plate.plate === plate1.plate)).toBe(true);
    });
});

describe("GetAllCarPlatesTest", () => {
    const plate1 = {
        plate: "abc-123"
    };
    const plate2 = {
        plate: "def-456"
    };
    it("Success", async () => {
        // Create the plates
        await testRequest.post("/plate/registerOne").send(plate1);
        await testRequest.post("/plate/registerOne").send(plate2);

        const result = await testRequest.get("/plate/getAll");
        expect(result.status).toEqual(200);
        expect(result.body.status).toEqual("Success");
        expect(result.body.results).toEqual(2);

        expect(result.body).toHaveProperty("data.carPlates");
        const carPlates: Array<ICarPlate> = result.body.data.carPlates;
        expect(carPlates.length).toEqual(2);

        // Contains both car plates
        expect(carPlates.some(
            plate => plate.plate === plate1.plate)).toBe(true);
        expect(carPlates.some(
            plate => plate.plate === plate1.plate)).toBe(true);
    });
});
