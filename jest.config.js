module.exports = {
    preset: 'ts-jest',
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
    },
    collectCoverage: true,
    coverageDirectory: 'test-results/',
    coveragePathIgnorePatterns: ['/node_modules', '/test'],
    bail: true,
}
