import { ICarPlate } from "../../models/CarPlates";

describe("CreateCarPlateTest", () => {
    const carPlate = {
        plate: "abc-123"
    };

    it("Success", async () => {
        const result = await testRequest.post("/plate/register").send(carPlate);
        expect(result.status).toEqual(200);
        expect(result.body.status).toEqual("Success");
        expect(result.body.message).toEqual("Car plate created");
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
        await testRequest.post("/plate/register").send(plate1);
        await testRequest.post("/plate/register").send(plate2);

        const result = await testRequest.get("/plate/getAll");
        expect(result.status).toEqual(200);
        expect(result.body.status).toEqual("Success");
        expect(result.body.results).toEqual(2);

        expect(result.body).toHaveProperty("data.carPlates");
        const carPlates: Array<ICarPlate> = result.body.data.carPlates;
        expect(carPlates.length).toEqual(2);

        // Contains both managers
        expect(carPlates.some(
            plate => plate.plate === plate1.plate)).toBe(true);
        expect(carPlates.some(
            plate => plate.plate === plate1.plate)).toBe(true);
    });
});
