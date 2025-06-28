# Firebase Firestore Session Store

This project uses a custom Firebase Firestore session store to replace the default MemoryStore for production-ready session management.

## Features

- ✅ **Production-ready**: Persistent sessions across server restarts
- ✅ **Scalable**: Uses Firebase Firestore for distributed session storage
- ✅ **Secure**: Automatic session expiration and cleanup
- ✅ **Customizable**: Configurable TTL and collection name
- ✅ **Compatible**: Works with express-session

## Configuration

### Environment Variables

Add these to your `.env` file:

```bash
# Session Secret (REQUIRED for production)
SESSION_SECRET=your-production-session-secret-key-change-this-in-production

# Session Configuration (Optional)
SESSION_COLLECTION=sessions
SESSION_TTL=604800000  # 1 week in milliseconds
```

### Production Setup

1. **Set SESSION_SECRET**: Use a strong, unique secret for production
2. **Configure Firebase**: Ensure Firebase credentials are properly set
3. **Set NODE_ENV**: Set to 'production' for secure cookies

## Usage

### Basic Usage

The session store is automatically configured in `app.js`:

```javascript
const FirebaseSessionStore = require('./sessionStore');

const firebaseSessionStore = new FirebaseSessionStore({
  collection: 'sessions',
  ttl: 7 * 24 * 60 * 60 * 1000 // 1 week
});

app.use(session({
  store: firebaseSessionStore,
  secret: process.env.SESSION_SECRET,
  // ... other options
}));
```

### Session Cleanup

Run periodic cleanup to remove expired sessions:

```bash
npm run cleanup-sessions
```

Or programmatically:

```javascript
const cleanupExpiredSessions = require('./cleanupSessions');
await cleanupExpiredSessions();
```

## Testing

Test the session store:

```bash
node testSessionStore.js
```

## Firebase Firestore Structure

Sessions are stored in the `sessions` collection with this structure:

```javascript
{
  "sessionId": {
    "data": {
      // Session data (user info, etc.)
    },
    "expires": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## Security Features

- **Automatic Expiration**: Sessions expire after TTL
- **Secure Cookies**: httpOnly, secure in production
- **SameSite**: Strict in production, lax in development
- **Custom Cookie Name**: `schoolzy.sid` instead of default
- **Session Cleanup**: Automatic removal of expired sessions

## Migration from MemoryStore

The session store is a drop-in replacement for MemoryStore. No changes needed to your session usage:

```javascript
// This works the same way
req.session.userId = user.id;
req.session.user = user;
```

## Troubleshooting

### Common Issues

1. **"Warning: connect.session() MemoryStore is not designed for production"**
   - ✅ **Fixed**: Using Firebase Firestore instead of MemoryStore

2. **Sessions not persisting after server restart**
   - ✅ **Fixed**: Sessions stored in Firebase Firestore

3. **Session expiration issues**
   - Check TTL configuration
   - Run session cleanup: `npm run cleanup-sessions`

### Debug Mode

Enable debug logging by setting:

```bash
DEBUG=express-session
```

## Performance Considerations

- **TTL**: Set appropriate TTL to balance security and user experience
- **Cleanup**: Run cleanup periodically to prevent collection bloat
- **Indexing**: Firebase automatically indexes the `expires` field for efficient queries

## Monitoring

Monitor session usage in Firebase Console:

1. Go to Firestore Database
2. Check the `sessions` collection
3. Monitor document count and size
4. Set up alerts for unusual activity 