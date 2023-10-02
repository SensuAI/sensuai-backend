"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    clearMocks: true,
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coveragePathIgnorePatterns: [
        '/node_modules/',
        '/src/db/',
    ],
    coverageProvider: 'v8',
    coverageReporters: [
        'json',
        'text',
        'lcov',
        'clover',
    ],
    moduleFileExtensions: [
        'js',
        'ts',
        'tsx',
    ],
    preset: 'ts-jest',
    roots: [
        '<rootDir>/src',
    ],
    testEnvironment: 'node',
    setupFilesAfterEnv: ["<rootDir>/src/tests/jest-setup.ts"],
};
//# sourceMappingURL=jest.config.js.map
