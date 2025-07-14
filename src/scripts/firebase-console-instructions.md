# Setting Admin Role in Firebase Console

If you prefer to directly set the admin role through the Firebase Console, follow these steps:

## Option 1: Using Firebase Console UI

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. In the left sidebar, click on "Firestore Database"
4. Navigate to the "users" collection
5. Find the document corresponding to the user with email "vikranthsai310@gmail.com"
6. Click on that document to open it
7. Click "Edit" (pencil icon)
8. If there's already an "isAdmin" field:
   - Change its value to `true`
9. If there's no "isAdmin" field:
   - Click "Add field"
   - Set field name to "isAdmin"
   - Set type to "boolean"
   - Set value to "true"
10. Click "Update" to save the changes

## Option 2: Using Firebase Console Rules

You can also set up security rules to automatically grant admin access to specific emails:

1. Go to the Firebase Console
2. Select "Firestore Database"
3. Go to the "Rules" tab
4. Modify your rules to include something like:

```
function isAdmin(request) {
  return request.auth != null && request.auth.token.email == 'vikranthsai310@gmail.com';
}

// Then use this function in your rules
match /some/path {
  allow read, write: if isAdmin(request);
}
```

## Option 3: Using Firebase Authentication Custom Claims

For more robust admin control, you can use custom claims (requires Firebase Admin SDK):

1. Set up a Firebase Function or server-side script
2. Use the Admin SDK to set a custom claim:

```javascript
admin.auth().getUserByEmail('vikranthsai310@gmail.com')
  .then((user) => {
    return admin.auth().setCustomUserClaims(user.uid, { admin: true });
  })
  .then(() => {
    console.log('Admin role set successfully');
  })
  .catch((error) => {
    console.error('Error setting admin role:', error);
  });
```

3. Then in your security rules, you can check:

```
allow read, write: if request.auth.token.admin == true;
```

## Verifying Admin Access

After setting the admin role, sign in with the account and try to access the admin pages:
- http://localhost:3000/admin (or your deployed URL)

You should now have access to the admin dashboard and all admin features. 