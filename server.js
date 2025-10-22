require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const { init, db } = require('./database.js');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// Session Middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'a-default-secret-key',
    resave: false,
    saveUninitialized: true,
}));

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Passport Configuration
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback'
}, (accessToken, refreshToken, profile, done) => {
    const { id, displayName, emails } = profile;
    const email = emails[0].value;

    db.get('SELECT * FROM users WHERE id = ?', [id], (err, user) => {
        if (err) return done(err);
        if (user) return done(null, user);

        db.run('INSERT INTO users (id, displayName, email) VALUES (?, ?, ?)', [id, displayName, email], (err) => {
            if (err) return done(err);
            const newUser = { id, displayName, email };
            db.run('INSERT INTO profiles (userId, username) VALUES (?, ?)', [id, displayName.replace(/\s/g, '').toLowerCase()], (err) => {
                if (err) console.error("Could not create default profile:", err);
            });
            return done(null, newUser);
        });
    });
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    db.get('SELECT * FROM users WHERE id = ?', [id], (err, user) => {
        done(err, user);
    });
});

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: function(req, file, cb){
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, req.user.id + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage }).single('profilePicture');

// Middleware to ensure user is authenticated
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}

// --- Routes ---
app.get('/', (req, res) => {
    res.render('index', { user: req.user });
});

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
    res.redirect('/dashboard');
});

app.get('/logout', (req, res, next) => {
    req.logout(err => {
        if (err) { return next(err); }
        res.redirect('/');
    });
});

app.get('/dashboard', ensureAuthenticated, (req, res) => {
    db.get('SELECT * FROM profiles WHERE userId = ?', [req.user.id], (err, profile) => {
        if (err) return res.status(500).send('Error fetching profile');
        if (!profile) {
            profile = { username: req.user.displayName.replace(/\s/g, '').toLowerCase(), description: '' };
        }
        db.all('SELECT * FROM links WHERE userId = ?', [req.user.id], (err, links) => {
            if (err) return res.status(500).send('Error fetching links');
            const templates = JSON.parse(fs.readFileSync('./templates.json'));
            res.render('dashboard', { user: req.user, profile, links, templates });
        });
    });
});

app.post('/dashboard', ensureAuthenticated, (req, res) => {
    const { username, description, zodiac, template } = req.body;
    db.run(
        'UPDATE profiles SET username = ?, description = ?, zodiac = ?, template = ? WHERE userId = ?',
        [username, description, zodiac, template, req.user.id],
        (err) => {
            if (err) return res.status(500).send('Error updating profile');
            res.redirect('/dashboard');
        }
    );
});

app.post('/dashboard/upload', ensureAuthenticated, (req, res) => {
    upload(req, res, (err) => {
        if(err){
            console.error(err);
            return res.redirect('/dashboard');
        }
        if(req.file == undefined){
            return res.redirect('/dashboard');
        }
        db.run('UPDATE profiles SET profilePicture = ? WHERE userId = ?', [req.file.filename, req.user.id], (err) => {
            if (err) return res.status(500).send('Error updating profile picture');
            res.redirect('/dashboard');
        });
    });
});

app.post('/dashboard/links/add', ensureAuthenticated, (req, res) => {
    const { title, url } = req.body;
    if (!title || !url) {
        return res.redirect('/dashboard');
    }
    db.run('INSERT INTO links (userId, title, url) VALUES (?, ?, ?)', [req.user.id, title, url], (err) => {
        if (err) return res.status(500).send('Error adding link');
        res.redirect('/dashboard');
    });
});

app.post('/dashboard/links/delete/:id', ensureAuthenticated, (req, res) => {
    db.run('DELETE FROM links WHERE id = ? AND userId = ?', [req.params.id, req.user.id], (err) => {
        if (err) return res.status(500).send('Error deleting link');
        res.redirect('/dashboard');
    });
});

app.get('/profile/:username', (req, res) => {
    const { username } = req.params;
    db.get('SELECT * FROM profiles WHERE username = ?', [username], (err, profile) => {
        if (err) return res.status(500).send('Database error');
        if (!profile) return res.status(404).send('Profile not found');
        db.all('SELECT * FROM links WHERE userId = ?', [profile.userId], (err, links) => {
            if (err) return res.status(500).send('Database error');
            const profileData = { ...profile, links };
            const templates = JSON.parse(fs.readFileSync('./templates.json'));
            const template = templates.find(t => t.id === profileData.template) || templates.find(t => t.id === 'default');
            let dailyHoroscope = null;
            if (profileData.zodiac) {
                const horoscopes = JSON.parse(fs.readFileSync('./horoscopes.json'));
                const zodiacHoroscopes = horoscopes[profileData.zodiac.toLowerCase()];
                if (zodiacHoroscopes) {
                    dailyHoroscope = zodiacHoroscopes[Math.floor(Math.random() * zodiacHoroscopes.length)];
                }
            }
            db.get('SELECT displayName FROM users WHERE id = ?', [profile.userId], (err, user) => {
                if (err) return res.status(500).send('Database error');
                res.render('profile', { profile: profileData, template, dailyHoroscope, user, req });
            });
        });
    });
});

// Owner page route
app.get('/owner', (req, res) => {
    res.render('owner');
});

async function startServer() {
    await init();
    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });
}

startServer();
