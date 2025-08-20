# Steward - Social Media Management Platform

A modern, full-stack social media management platform built with Node.js, Express, MongoDB, and React with Tailwind CSS.

## 🚀 Features

- **Multi-Platform Posting**: Post content to Twitter, LinkedIn, Instagram, and Facebook
- **Content Scheduling**: Schedule posts for future publication
- **Rich Content Editor**: Support for text, images, and videos
- **User Authentication**: Secure user registration and login
- **Dashboard Analytics**: View post statistics and engagement metrics
- **Modern UI**: Beautiful, responsive interface built with Tailwind CSS
- **Real-time Updates**: Live status updates and notifications

## 🏗️ Architecture

### Backend (Node.js + Express)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based authentication with bcrypt
- **Social Media APIs**: Integration with Twitter, LinkedIn, Instagram, and Facebook
- **File Upload**: Support for media uploads
- **Validation**: Request validation and error handling

### Frontend (React + Tailwind CSS)
- **Framework**: React 18 with React Router
- **Styling**: Tailwind CSS for modern, responsive design
- **State Management**: React Context API
- **UI Components**: Custom components with Lucide React icons
- **Forms**: Controlled components with validation

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Steward
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the backend directory:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/steward
   JWT_SECRET=your-secret-key-here
   NODE_ENV=development
   ```

4. **Start the backend server**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Start the frontend development server**
   ```bash
   npm start
   ```

The application will be available at `http://localhost:3000`

## 🎯 Usage

### Getting Started

1. **Register/Login**: Create a new account or sign in with existing credentials
2. **Connect Social Media**: Link your social media accounts (Twitter, LinkedIn, Instagram, Facebook)
3. **Create Posts**: Use the rich content editor to create posts with text, images, or videos
4. **Schedule Content**: Set future publication dates for your posts
5. **Monitor Performance**: View analytics and engagement metrics on the dashboard

### Key Features

- **Dashboard**: Overview of post statistics, recent posts, and platform connections
- **Create Post**: Rich text editor with media upload, platform selection, and scheduling
- **Posts Management**: View, edit, delete, and manage all your posts
- **Profile Settings**: Update profile information and manage social media connections

## 🔧 Configuration

### Social Media API Setup

To enable social media posting, you'll need to configure API keys for each platform:

#### Twitter
1. Create a Twitter Developer account
2. Create a new app
3. Generate API keys and access tokens
4. Add to environment variables

#### LinkedIn
1. Create a LinkedIn Developer account
2. Create a new app
3. Configure OAuth 2.0 settings
4. Generate access tokens

#### Instagram
1. Use Facebook Developer account
2. Create Instagram Basic Display app
3. Configure permissions
4. Generate access tokens

#### Facebook
1. Create Facebook Developer account
2. Create a new app
3. Configure permissions
4. Generate access tokens

## 📁 Project Structure

```
Steward/
├── backend/
│   ├── controllers/          # Route controllers
│   ├── models/              # MongoDB schemas
│   ├── routes/              # API routes
│   ├── services/            # Business logic
│   ├── middlewares/         # Custom middlewares
│   ├── config/              # Configuration files
│   ├── utils/               # Utility functions
│   └── server.js           # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   ├── styles/         # CSS files
│   │   └── App.js          # Main app component
│   ├── public/             # Static files
│   └── package.json        # Frontend dependencies
└── README.md              # Project documentation
```

## 🚀 Deployment

### Backend Deployment

1. **Environment Setup**
   - Set production environment variables
   - Configure MongoDB connection string
   - Set up SSL certificates

2. **Process Management**
   - Use PM2 or similar process manager
   - Configure reverse proxy (Nginx)
   - Set up monitoring and logging

### Frontend Deployment

1. **Build Production**
   ```bash
   npm run build
   ```

2. **Deploy**
   - Upload build files to web server
   - Configure reverse proxy
   - Set up CDN for static assets

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Contact the development team

## 🔮 Roadmap

- [ ] AI-powered content generation
- [ ] Advanced analytics and reporting
- [ ] Team collaboration features
- [ ] Mobile app development
- [ ] Integration with more platforms
- [ ] Advanced scheduling features
- [ ] Content templates
- [ ] Automated posting rules
