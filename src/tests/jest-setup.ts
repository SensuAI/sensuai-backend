import crypto from "crypto";
import Server from "../providers/Server";
import supertest from "supertest";

// Dev Dependencies
import express from "express";
import cors from "cors";
import UserController from "../controllers/UserController";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
let server: Server;
let mongodb: MongoMemoryServer;

const second:number = 1000;
jest.setTimeout(10000*second);

beforeAll(async () => {
  // Setup Mocks
  jest.spyOn(crypto, "randomBytes").mockImplementation((length) => {
    // console.log("crypto randomBytes mock called");

    // Return all zeroes
    return Buffer.alloc(length);
  });

  mongodb = await MongoMemoryServer.create();

  const mongodb_uri = mongodb.getUri();

  server = new Server({
    port: 8080,
    middlewares: [
      express.json(),
      express.urlencoded({ extended: true }),
      cors(),
    ],
    controllers: [
      UserController.getInstance()
    ],
    env: "development"
  });
  server.databaseConnect(mongodb_uri);
  global.testRequest = supertest(server.app);
});

beforeEach(async () => {
  // Reset the database after each describe block, isolating the unit-tests
  const collections = Object.keys(mongoose.connection.collections);
  for (const collectionName of collections) {
    const collection = mongoose.connection.collections[collectionName];
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  server.databaseDisconnect();
  await mongodb.stop();
  await server.close();
  jest.restoreAllMocks();
});
