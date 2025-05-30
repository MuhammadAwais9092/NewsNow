// Load environment variables from .env at the top
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const passport = require('passport');
const session = require('express-session');
const User = require('./models/user');
const auth = require('./middleware/auth');
require('./passport-config');

const app = express();

// Use dynamic port from .env (important for Render)
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration with secure cookies in production
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// Make user available to all templates
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
const users = require('./routes/users');
app.use('/users', users);

// Google OAuth routes
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Update callback URL based on environment
app.get('/auth/google/callback', 
  passport.authenticate('google', { 
    failureRedirect: '/login.html',
    successRedirect: '/'
  })
);

// Update logout route
app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.redirect('/');
  });
});

// Admin route protection
app.use('/admin', auth, express.static(path.join(__dirname, 'public/admin')));

// Static routes
app.use('/', express.static(path.join(__dirname, 'public/landing')));

// Login route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email, password });
    if (user) {
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ error: 'Login failed' });
        }
        res.json({ message: 'Login successful' });
      });
    } else {
      res.status(401).json({ error: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});