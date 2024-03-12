import type { Config } from '@jest/types';

// Sync object
const config: Config.InitialOptions = {
    verbose: true,
    collectCoverage: true,
    transform: {
        '^.+\\.ts$': 'ts-jest'
    },
    testMatch: ['**/*.test.ts']
};

export default config;
