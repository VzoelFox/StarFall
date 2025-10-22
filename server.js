const express = require('express');
const fs = require('fs');
const short = require('short-uuid');
const app = express();
const port = 3000;

const PROFILES_FILE = './profiles.json';

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Read profiles from file
const readProfiles = () => {
    if (!fs.existsSync(PROFILES_FILE)) {
        return {};
    }
    const data = fs.readFileSync(PROFILES_FILE);
    return JSON.parse(data);
};

// Write profiles to file
const writeProfiles = (data) => {
    fs.writeFileSync(PROFILES_FILE, JSON.stringify(data, null, 2));
};

app.get('/', (req, res) => {
    res.render('index');
});

app.post('/api/create', (req, res) => {
    const profiles = readProfiles();
    const id = short.generate();
    profiles[id] = req.body;
    writeProfiles(profiles);
    res.json({ id });
});

app.get('/profile/:id', (req, res) => {
    const profiles = readProfiles();
    const profile = profiles[req.params.id];
    if (profile) {
        res.render('profile', { profile, req }); // Pass req to construct download URL
    } else {
        res.status(404).send('Profile not found');
    }
});

app.get('/profile/:id/download', (req, res) => {
    const profiles = readProfiles();
    const profile = profiles[req.params.id];
    if (profile) {
        res.render('downloadable_profile', { profile }, (err, html) => {
            if (err) {
                res.status(500).send('Error rendering profile');
                return;
            }
            res.setHeader('Content-Disposition', `attachment; filename="${profile.name.replace(/\s/g, '_')}_profile.html"`);
            res.setHeader('Content-Type', 'text/html');
            res.send(html);
        });
    } else {
        res.status(404).send('Profile not found');
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
