# Schoolzy 🎓

A comprehensive school directory application that helps parents and students discover, compare, and review schools in their area. Built with Node.js, Express, Firebase Firestore, and modern web technologies.

## ✨ Features

- **🔍 School Search & Discovery**: Find schools by location, category, and ratings
- **🗺️ Interactive Map**: View schools on an interactive map with location-based search
- **⭐ Reviews & Ratings**: Read and write reviews for schools
- **👤 User Authentication**: Secure login/registration with Google OAuth
- **📱 Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **🎨 Modern UI**: Beautiful, intuitive interface with dark mode support
- **📊 School Details**: Comprehensive information about each school

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Firebase project with Firestore enabled

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd Schoolzy
   ```

2. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Set up Firebase**
   - Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
   - Enable Firestore database
   - Download your service account key and save as `backend/serviceAccountKey.json`

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   - Navigate to `http://localhost:5000`
   - Your Schoolzy app should be running!

## 📁 Project Structure

```
Schoolzy/
├── backend/                 # Node.js/Express server
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Authentication middleware
│   ├── routes/            # API routes
│   ├── firestore.js       # Firebase configuration
│   ├── server.js          # Main server file
│   └── package.json       # Backend dependencies
├── frontend/              # Static frontend files
│   ├── index.html         # Main application page
│   ├── app.js            # Frontend JavaScript
│   ├── styles.css        # Application styles
│   └── *.html            # Additional pages
└── README.md             # This file
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
NODE_ENV=development
PORT=5000
JWT_SECRET=your-super-secret-jwt-key
CORS_ORIGIN=http://localhost:3000
```

### Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable Firestore Database
4. Go to Project Settings → Service Accounts
5. Generate new private key
6. Save as `backend/serviceAccountKey.json`

## 🛠️ API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Schools
- `GET /api/schools` - Get all schools
- `GET /api/schools/:id` - Get school by ID

### Reviews
- `GET /api/reviews/:schoolId` - Get reviews for a school
- `POST /api/reviews/:schoolId` - Add a review

## 🚀 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy Options:
- **Render.com** (Recommended - Free)
- **Railway.app** (Full-stack friendly)
- **Heroku** (Reliable, paid)
- **Vercel** (Great for frontend)

## 🎯 Features in Detail

### School Discovery
- Search by name, location, or category
- Filter by school type (Public/Private)
- Filter by rating
- Sort by various criteria

### Interactive Map
- View schools on an interactive map
- Search by city or location
- Set custom radius for nearby schools
- Click markers for quick school info

### User System
- Secure authentication with JWT
- Google OAuth integration
- User profiles with avatars
- Email verification (coming soon)

### Review System
- Rate schools from 1-5 stars
- Write detailed reviews
- View review history
- Helpful voting system

## 🛡️ Security

- JWT-based authentication
- Password hashing with bcrypt
- CORS protection
- Input validation
- Firebase security rules

## 🎨 UI/UX Features

- **Responsive Design**: Works on all devices
- **Dark Mode**: Toggle between light and dark themes
- **Modern Animations**: Smooth transitions and interactions
- **Accessibility**: WCAG compliant design
- **Loading States**: User-friendly loading indicators

## 🔮 Future Enhancements

- [ ] Email verification system
- [ ] School comparison tool
- [ ] Advanced filtering options
- [ ] School photos and galleries
- [ ] Parent community features
- [ ] Mobile app (React Native)
- [ ] Admin dashboard
- [ ] Analytics and insights

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Firebase](https://firebase.google.com) for backend services
- [Leaflet](https://leafletjs.com) for interactive maps
- [Font Awesome](https://fontawesome.com) for icons
- [Express.js](https://expressjs.com) for the web framework

## 📞 Support

If you have any questions or need help:
- Create an issue in this repository
- Check the [deployment guide](./DEPLOYMENT.md)
- Review the Firebase documentation

---

Made with ❤️ for better education discovery