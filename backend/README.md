# Accessible Web Low-Literacy Backend API

A comprehensive Node.js/Express backend API for the Accessible Web Low-Literacy application, providing AI-powered text processing, user management, analytics, and accessibility features.

## Features

### 🤖 AI-Powered Text Processing
- **Text Simplification**: Convert complex text to grade-appropriate reading levels
- **Real-time Translation**: Multi-language support for accessibility
- **Smart Rewriting**: Tone and clarity improvements
- **Grammar & Spell Check**: Automated proofreading
- **Readability Analysis**: Flesch-Kincaid, Gunning Fog, and other metrics

### 👤 User Management
- **JWT Authentication**: Secure login/registration system
- **User Preferences**: Customizable accessibility settings
- **Profile Management**: Account settings and preferences
- **Session Tracking**: Reading session analytics

### 📊 Analytics & Progress
- **Reading Analytics**: Track progress and improvements
- **Usage Statistics**: Feature usage and patterns
- **Performance Metrics**: Reading speed and comprehension
- **Dashboard Data**: Comprehensive user insights

### ⚙️ Settings & Configuration
- **Accessibility Options**: Font size, contrast, motion preferences
- **TTS Configuration**: Text-to-speech settings and voice options
- **Language Support**: Multi-language interface and content
- **Export/Import**: Settings backup and restore

## API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `POST /refresh` - Token refresh
- `POST /logout` - User logout
- `GET /me` - Get current user profile

### Text Processing (`/api/text`)
- `POST /process` - Process text (simplify, translate, rewrite, proofread)
- `POST /analyze` - Analyze text readability without processing
- `GET /history` - Get processing history
- `GET /languages` - Get supported languages
- `DELETE /history/:id` - Delete processing record

### User Management (`/api/user`)
- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile
- `GET /preferences` - Get user preferences
- `PUT /preferences` - Update user preferences
- `DELETE /account` - Delete user account

### Settings (`/api/settings`)
- `GET /` - Get user settings (with defaults for anonymous users)
- `PUT /` - Update user settings
- `POST /reset` - Reset settings to defaults
- `GET /export` - Export settings as JSON

### Analytics (`/api/analytics`)
- `GET /dashboard` - Get dashboard analytics
- `GET /progress` - Get reading progress data

### Health (`/api/health`)
- `GET /` - Basic health check
- `GET /ready` - Readiness check for deployment
- `GET /live` - Liveness check for Kubernetes

## Database Schema

### Users Table
```sql
- id (UUID, Primary Key)
- email (String, Unique)
- username (String, Unique)
- password_hash (String)
- created_at, updated_at (Timestamps)
- last_login (Timestamp, Nullable)
- is_active (Boolean)
- email_verified (Boolean)
```

### User Preferences Table
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key)
- font_size (Enum: small, medium, large, extra-large)
- language (String)
- high_contrast, reduce_motion, dark_mode (Booleans)
- tts_enabled (Boolean)
- tts_speed (Float)
- tts_voice (String, Nullable)
- auto_simplify (Boolean)
- reading_level_preference (Enum)
- notification_preferences (JSON)
```

### Text Processing Results Table
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key, Nullable)
- session_id (String)
- original_text, processed_text (Text)
- action (String)
- options, analysis (JSON)
- processing_time_ms (Integer)
- created_at (Timestamp)
```

### Reading Sessions Table
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key, Nullable)
- session_token (String, Unique)
- start_time, end_time (Timestamps)
- total_duration_seconds (Integer)
- texts_processed, words_read (Integers)
- actions_performed (JSON Array)
- user_agent, ip_address (Strings)
```

## Installation & Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- SQLite3 (included)

### Environment Setup
1. Clone the repository
2. Navigate to the backend directory:
   ```bash
   cd backend
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Create environment file:
   ```bash
   cp .env.example .env
   ```

5. Configure environment variables in `.env`:
   ```env
   NODE_ENV=development
   PORT=3001
   DATABASE_PATH=./data/database.sqlite
   JWT_SECRET=your-super-secret-jwt-key
   OPENAI_API_KEY=your-openai-api-key (optional)
   ```

### Development

1. **Start development server:**
   ```bash
   npm run dev
   ```

2. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

3. **Run database migrations:**
   ```bash
   npm run db:migrate
   ```

4. **Seed test data:**
   ```bash
   npm run db:seed
   ```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Type checking
npm run typecheck
```

## API Usage Examples

### Text Processing
```javascript
// Simplify text
const response = await fetch('/api/text/process', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: 'This is an extremely complex sentence with sophisticated vocabulary.',
    action: 'simplify',
    options: {
      reading_level: 'elementary',
      max_sentences: 5
    }
  })
});

const result = await response.json();
console.log(result.data.processed_text);
```

### User Authentication
```javascript
// Register user
const registerResponse = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    username: 'testuser',
    password: 'SecurePass123!',
    confirm_password: 'SecurePass123!'
  })
});

const { token } = (await registerResponse.json()).data;

// Use token for authenticated requests
const profileResponse = await fetch('/api/user/profile', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

## Text Analysis Features

### Reading Level Detection
- **Flesch-Kincaid Grade Level**: Academic grade level assessment
- **Flesch Reading Ease**: Readability score (0-100)
- **Gunning Fog Index**: Years of formal education needed
- **Coleman-Liau Index**: Grade level based on characters
- **Automated Readability Index**: Character and sentence analysis

### Text Simplification
- **Vocabulary Replacement**: Complex words → simple alternatives
- **Sentence Shortening**: Break long sentences into shorter ones
- **Grammar Simplification**: Remove unnecessary complexity
- **Reading Level Targeting**: Grade 5, 8, or 12 level output

### Language Support
- **Detection**: Automatic language identification using `franc`
- **Translation**: Multi-language support (extensible)
- **Localization**: UI text in multiple languages

## Security Features

### Authentication & Authorization
- **JWT Tokens**: Secure stateless authentication
- **Password Hashing**: bcrypt with configurable rounds
- **Rate Limiting**: Prevent abuse and brute force attacks
- **Input Validation**: express-validator for all inputs

### Data Protection
- **CORS**: Configurable cross-origin resource sharing
- **Helmet**: Security headers and protections
- **SQL Injection Prevention**: Parameterized queries with Kysely
- **XSS Protection**: Input sanitization and output encoding

## Deployment

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

### Environment Variables (Production)
```env
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://user:pass@host:port/db
JWT_SECRET=production-secret-key
OPENAI_API_KEY=production-openai-key
CORS_ORIGINS=https://yourdomain.com
```

### Health Checks
The API provides multiple health check endpoints for monitoring:

- **Basic Health**: `GET /api/health`
- **Readiness**: `GET /api/health/ready` (checks database connectivity)
- **Liveness**: `GET /api/health/live` (basic process check)

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make changes and add tests
4. Commit with descriptive messages
5. Push to the branch: `git push origin feature-name`
6. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Open an issue on GitHub
- Check the documentation
- Review API examples above

---

**Built with ❤️ for accessibility and inclusive web experiences**