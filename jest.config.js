module.exports = {
   rootDir: ".",
   roots: ["."],
   moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@controllers/(.*)": "<rootDir>/src/api/controllers/$1",
    "^@errors/(.*)": "<rootDir>/src/api/errors/$1",
    "^@interfaces/(.*)": "<rootDir>/src/api/interfaces/$1",
    "^@middleware/(.*)": "<rootDir>/src/api/middleware/$1",
    "^@routes/(.*)": "<rootDir>/src/api/routes/$1",
    "^@services/(.*)": "<rootDir>/src/api/services/$1",
    "^@utils/(.*)": "<rootDir>/src/api/utils/$1",
    "^@helpers/(.*)": "<rootDir>/src/api/helpers/$1"
  },
  globals: {
      "ts-jest": {
          tsconfig: "tsconfig.json"
      }
  },
  moduleFileExtensions: [
      "ts",
      "js"
  ],
  transform: {
      "^.+\\.(ts|tsx)$": "ts-jest"
  },
  testMatch: [
      "**/tests/**/*.test.(ts|js)"
  ],
  testEnvironment: "node"
};