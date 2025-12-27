import '@testing-library/jest-dom';
import { vi, beforeEach, beforeAll, afterAll } from 'vitest';

// Mock Firebase
vi.mock('@/lib/firebase', () => ({
    db: {},
    auth: {
        currentUser: { uid: 'test-user-123', email: 'test@example.com' },
    },
}));

// Mock fetch for API tests
global.fetch = vi.fn();

// Reset mocks before each test
beforeEach(() => {
    vi.resetAllMocks();
});

// Console spy
const originalError = console.error;
beforeAll(() => {
    console.error = (...args) => {
        if (
            typeof args[0] === 'string' &&
            args[0].includes('Warning: ReactDOM.render is no longer supported')
        ) {
            return;
        }
        originalError.call(console, ...args);
    };
});

afterAll(() => {
    console.error = originalError;
});
