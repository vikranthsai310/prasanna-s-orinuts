# Environment Setup Guide

This guide explains how to set up the environment variables needed for the Premium Orchard e-commerce application.

## Creating the .env file

Create a file named `.env` in the root of your project with the following variables:

```
# Firebase Configuration
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id

# Firebase Emulator Configuration
VITE_USE_FIREBASE_EMULATORS=false

# Razorpay Configuration
VITE_RAZORPAY_KEY_ID=your-razorpay-key-id
```

## Firebase Configuration

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Go to Project Settings > General
4. Scroll down to "Your apps" and click the web app icon (`</>`)
5. Register your app if you haven't already
6. Copy the Firebase configuration values to your `.env` file

## Razorpay Configuration

1. Sign up for a [Razorpay account](https://razorpay.com/)
2. Go to the Razorpay Dashboard
3. Navigate to Settings > API Keys
4. Generate a new API key pair if you don't have one
5. Copy the Key ID to your `.env` file as `VITE_RAZORPAY_KEY_ID`
6. For server-side integration, you'll also need the Key Secret, but this should only be used in secure backend environments

## Development vs Production

For development:
- Use test mode API keys from Razorpay
- You can set `VITE_USE_FIREBASE_EMULATORS=true` if you're using Firebase emulators

For production:
- Use production API keys from Razorpay
- Set `VITE_USE_FIREBASE_EMULATORS=false`
- Make sure to set up proper Firebase security rules

## Testing Razorpay Integration

For testing payments, you can use the following test card details:
- Card Number: 4111 1111 1111 1111
- Expiry: Any future date
- CVV: Any 3 digits
- OTP: 1234 