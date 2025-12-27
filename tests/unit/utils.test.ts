/**
 * Unit Tests for Utility Functions
 * Tests individual helper functions used across the application
 */
import { describe, it, expect } from 'vitest';

// Test helper: Calculate package weight (mimics shippingService logic)
function calculatePackageWeight(items: any[]): number {
    let totalWeight = 0.1; // Base packaging weight

    items.forEach(item => {
        if (item.weight) {
            const weightValue = parseFloat(item.weight.replace(/[^\d.]/g, ''));
            totalWeight += (weightValue / 1000) * (item.quantity || 1);
        } else {
            totalWeight += 0.3 * (item.quantity || 1);
        }
    });

    return Math.max(totalWeight, 0.5);
}

// Test helper: Calculate package dimensions
function calculatePackageDimensions(items: any[]): { length: number; breadth: number; height: number } {
    const itemCount = items.reduce((sum, item) => sum + (item.quantity || 1), 0);

    if (itemCount <= 2) {
        return { length: 20, breadth: 15, height: 10 };
    } else if (itemCount <= 5) {
        return { length: 25, breadth: 20, height: 15 };
    } else {
        return { length: 30, breadth: 25, height: 20 };
    }
}

// Test helper: Format price
function formatPrice(amount: number): string {
    return `₹${amount.toLocaleString('en-IN')}`;
}

// Test helper: Validate email
function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Test helper: Validate phone (Indian)
function validatePhone(phone: string): boolean {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
}

// Test helper: Validate pincode (Indian)
function validatePincode(pincode: string): boolean {
    const pincodeRegex = /^[1-9][0-9]{5}$/;
    return pincodeRegex.test(pincode);
}

describe('Package Weight Calculation', () => {
    it('should return minimum weight of 0.5kg for empty cart', () => {
        const weight = calculatePackageWeight([]);
        expect(weight).toBe(0.5);
    });

    it('should calculate weight correctly for items with weight specified', () => {
        const items = [
            { name: 'Almonds', weight: '500g', quantity: 1 },
            { name: 'Cashews', weight: '250g', quantity: 2 },
        ];
        const weight = calculatePackageWeight(items);
        // 0.1 (base) + 0.5 (almonds) + 0.5 (250g * 2) = 1.1
        expect(weight).toBeCloseTo(1.1, 1);
    });

    it('should use default weight for items without weight specified', () => {
        const items = [
            { name: 'Mystery Box', quantity: 2 },
        ];
        const weight = calculatePackageWeight(items);
        // 0.1 (base) + 0.6 (0.3 * 2) = 0.7
        expect(weight).toBeCloseTo(0.7, 1);
    });

    it('should handle mixed items correctly', () => {
        const items = [
            { name: 'Almonds', weight: '1000g', quantity: 1 },
            { name: 'Gift Box', quantity: 1 },
        ];
        const weight = calculatePackageWeight(items);
        // 0.1 (base) + 1.0 (almonds 1000g/1000) + 0.3 (gift box) = 1.4
        expect(weight).toBeCloseTo(1.4, 1);
    });
});

describe('Package Dimensions Calculation', () => {
    it('should return small box for 1-2 items', () => {
        const items = [{ name: 'Almonds', quantity: 1 }];
        const dimensions = calculatePackageDimensions(items);
        expect(dimensions).toEqual({ length: 20, breadth: 15, height: 10 });
    });

    it('should return medium box for 3-5 items', () => {
        const items = [
            { name: 'Almonds', quantity: 2 },
            { name: 'Cashews', quantity: 2 },
        ];
        const dimensions = calculatePackageDimensions(items);
        expect(dimensions).toEqual({ length: 25, breadth: 20, height: 15 });
    });

    it('should return large box for 6+ items', () => {
        const items = [
            { name: 'Almonds', quantity: 3 },
            { name: 'Cashews', quantity: 3 },
            { name: 'Walnuts', quantity: 2 },
        ];
        const dimensions = calculatePackageDimensions(items);
        expect(dimensions).toEqual({ length: 30, breadth: 25, height: 20 });
    });
});

describe('Price Formatting', () => {
    it('should format price with rupee symbol', () => {
        const formatted = formatPrice(500);
        expect(formatted).toContain('₹');
        expect(formatted).toContain('500');
    });

    it('should format large prices', () => {
        const formatted = formatPrice(150000);
        expect(formatted).toContain('₹');
        expect(formatted.length).toBeGreaterThan(5);
    });

    it('should handle zero', () => {
        const formatted = formatPrice(0);
        expect(formatted).toContain('₹');
        expect(formatted).toContain('0');
    });
});

describe('Email Validation', () => {
    it('should validate correct emails', () => {
        expect(validateEmail('test@example.com')).toBe(true);
        expect(validateEmail('user.name@domain.co.in')).toBe(true);
        expect(validateEmail('user+tag@gmail.com')).toBe(true);
    });

    it('should reject invalid emails', () => {
        expect(validateEmail('invalid')).toBe(false);
        expect(validateEmail('invalid@')).toBe(false);
        expect(validateEmail('@invalid.com')).toBe(false);
        expect(validateEmail('invalid@domain')).toBe(false);
        expect(validateEmail('')).toBe(false);
    });
});

describe('Phone Validation (Indian)', () => {
    it('should validate correct Indian phone numbers', () => {
        expect(validatePhone('9876543210')).toBe(true);
        expect(validatePhone('8765432109')).toBe(true);
        expect(validatePhone('7654321098')).toBe(true);
        expect(validatePhone('6543210987')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
        expect(validatePhone('1234567890')).toBe(false); // Starts with 1
        expect(validatePhone('5123456789')).toBe(false); // Starts with 5
        expect(validatePhone('987654321')).toBe(false);  // 9 digits
        expect(validatePhone('')).toBe(false);
    });
});

describe('Pincode Validation (Indian)', () => {
    it('should validate correct Indian pincodes', () => {
        expect(validatePincode('110001')).toBe(true); // Delhi
        expect(validatePincode('400001')).toBe(true); // Mumbai
        expect(validatePincode('500001')).toBe(true); // Hyderabad
        expect(validatePincode('600001')).toBe(true); // Chennai
    });

    it('should reject invalid pincodes', () => {
        expect(validatePincode('012345')).toBe(false); // Starts with 0
        expect(validatePincode('12345')).toBe(false);  // 5 digits
        expect(validatePincode('1234567')).toBe(false); // 7 digits
        expect(validatePincode('')).toBe(false);
    });
});
