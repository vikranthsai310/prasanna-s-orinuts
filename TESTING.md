# 🧪 Testing Guide for Prasanna Premium Orchard

This guide explains how to run and write tests for the project.

## 📊 Test Types

| Type | Command | What it tests |
|------|---------|---------------|
| **Unit Tests** | `npm test` | Individual functions |
| **Integration Tests** | `npm test` | API endpoints, services |
| **E2E Tests** | `npm run test:e2e` | Full user flows in browser |

---

## 🚀 Quick Start

### Run All Unit & Integration Tests
```bash
npm run test:run
```

### Run Tests in Watch Mode (development)
```bash
npm test
```

### Run Tests with Coverage Report
```bash
npm run test:coverage
```

### Run E2E Tests
```bash
npm run test:e2e
```

### Run E2E Tests with UI (visual mode)
```bash
npm run test:e2e:ui
```

### Run All Tests
```bash
npm run test:all
```

---

## 📁 Test Structure

```
prasanna-premium-orchard/
├── tests/
│   ├── setup.ts              # Test configuration & mocks
│   ├── unit/
│   │   └── utils.test.ts     # Utility function tests
│   └── integration/
│       └── api.test.ts       # API endpoint tests
├── e2e/
│   ├── homepage.spec.ts      # Homepage & navigation tests
│   ├── cart.spec.ts          # Product & cart flow tests
│   ├── auth.spec.ts          # Login & registration tests
│   └── admin.spec.ts         # Admin panel tests
├── vitest.config.ts          # Unit/Integration test config
└── playwright.config.ts      # E2E test config
```

---

## 🧪 What's Being Tested

### Unit Tests (`tests/unit/`)

| Test Suite | What it covers |
|------------|----------------|
| Package Weight Calculation | Weight calculation for shipping |
| Package Dimensions | Box size based on items |
| Price Formatting | INR currency formatting |
| Email Validation | Email format validation |
| Phone Validation | Indian phone number validation |
| Pincode Validation | Indian pincode validation |

### Integration Tests (`tests/integration/`)

| Test Suite | What it covers |
|------------|----------------|
| POST /api/send-order-email | Email sending API |
| POST /api/verify-payment | Payment verification |
| Shiprocket Order Creation | Order push to Shiprocket |
| Order Status Flow | Status transitions |
| Email Templates | Subject line generation |

### E2E Tests (`e2e/`)

| Test Suite | What it covers |
|------------|----------------|
| Homepage | Page load, navigation, responsiveness |
| Products & Cart | Browsing, add to cart, checkout |
| Authentication | Login, register, password reset |
| Admin Panel | Order management, product management |

---

## 🔧 Writing New Tests

### Unit Test Example
```typescript
import { describe, it, expect } from 'vitest';

describe('My Feature', () => {
  it('should do something', () => {
    const result = myFunction(input);
    expect(result).toBe(expected);
  });
});
```

### E2E Test Example
```typescript
import { test, expect } from '@playwright/test';

test('should navigate to products', async ({ page }) => {
  await page.goto('/');
  await page.click('a:has-text("Products")');
  await expect(page).toHaveURL(/products/);
});
```

---

## 📈 Coverage Report

After running `npm run test:coverage`, view the HTML report at:
```
coverage/index.html
```

---

## 🐛 Debugging Tests

### Debug Unit Tests
```bash
npm test -- --reporter=verbose
```

### Debug E2E Tests
```bash
npm run test:e2e:headed
```
This opens the browser so you can see what's happening.

### View E2E Test Report
After running E2E tests:
```bash
npx playwright show-report
```

---

## ✅ Pre-Deployment Checklist

Before deploying to production, run:

```bash
# 1. Run all unit/integration tests
npm run test:run

# 2. Run E2E tests
npm run test:e2e

# 3. Check test coverage
npm run test:coverage
```

All tests should pass before deployment! ✅
