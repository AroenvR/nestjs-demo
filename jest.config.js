module.exports = {
    preset: 'ts-jest',
    rootDir: 'src',
    moduleFileExtensions: [
        "js",
        "json",
        "ts"
    ],
    testMatch: ['**/*.test.ts'],
    moduleNameMapper: {
        '@/(.*)': '<rootDir>/$1',
    },
    transform: {
        "^.+\\.(t|j)s$": "ts-jest"
    },
    collectCoverageFrom: [
        "**/*.(t|j)s"
    ],
    coverageDirectory: "../coverage",
    coveragePathIgnorePatterns: [
        "<rootDir>/main.ts"
    ],
    testEnvironment: "node",
    setupFilesAfterEnv: ['<rootDir>/__tests__/jest.setup.ts'],
};