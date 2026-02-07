import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import mysql from 'mysql2/promise';
import crypto from 'crypto';
import fs from 'fs';
import { GoogleGenAI } from "@google/genai";

// --- CONFIGURATION ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database Config
const dbConfig = {
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'dhafer',
    password: process.env.DB_PASSWORD || 'dhafer123', 
    database: process.env.DB_NAME || 'bacphysiquechimie',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

const app = express();
const server = createServer(app);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.set('trust proxy', true);

// --- DATABASE POOL ---
let pool;
try {
    pool = mysql.createPool(dbConfig);
    console.log("✅ Database configuration loaded.");
} catch (e) {
    console.error("❌ Database config error:", e.message);
}

// Initialize Tables
const initDB = async () => {
    if (!pool) return;
    try {
        const connection = await pool.getConnection();
        await connection.query(`CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(50) NOT NULL, email VARCHAR(50) UNIQUE NOT NULL, password TEXT NOT NULL, role TEXT NOT NULL, ip_address VARCHAR(45), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`);
        await connection.query(`CREATE TABLE IF NOT EXISTS resources (id INT AUTO_INCREMENT PRIMARY KEY, title TEXT NOT NULL, description TEXT, type TEXT NOT NULL, category TEXT, url LONGTEXT, thumbnail LONGTEXT, date TEXT, size TEXT, parent_id TEXT, owner_id TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`);
        await connection.query(`CREATE TABLE IF NOT EXISTS forum_posts (id INT AUTO_INCREMENT PRIMARY KEY, user_id TEXT NOT NULL, user_name TEXT NOT NULL, user_role TEXT NOT NULL, title TEXT NOT NULL, content TEXT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`);
        await connection.query(`CREATE TABLE IF NOT EXISTS forum_answers (id INT AUTO_INCREMENT PRIMARY KEY, post_id INT, user_id TEXT NOT NULL, user_name TEXT NOT NULL, user_role TEXT NOT NULL, content TEXT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`);
        connection.release();
    } catch (err) {
        console.error("⚠️ Database connection failed.", err.message);
    }
};
initDB();

// --- AI LOGIC ---
let dailyFactCache = { date: null, data: null };
const generateDailyFact = async () => {
    const today = new Date().toDateString();
    if (dailyFactCache.date === today && dailyFactCache.data) return dailyFactCache.data;
    try {
        if (!process.env.GEMINI_API_KEY) throw new Error("No Key");
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: `Génère un fait scientifique fascinant pour des élèves de Baccalauréat. Sujet: Physique ou Chimie. Format JSON: { "title": "...", "content": "...", "fact": "...", "category": "PHYSICS"|"CHEMISTRY"|"SPACE"|"ATOM" }`,
            config: { responseMimeType: "application/json" }
        });
        const data = JSON.parse(response.text);
        dailyFactCache = { date: today, data: data };
        return data;
    } catch (error) {
        return {
            title: "Le Chat de Schrödinger",
            content: "Une expérience de pensée illustrant les paradoxes de la mécanique quantique.",
            fact: "Le chat est à la fois mort et vivant tant qu'on ne regarde pas.",
            category: "ATOM"
        };
    }
};

// --- SOCKET.IO ---
const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"],
    credentials: true
  }
});

// --- SESSION STORAGE ---
const sessions = new Map();
const createSession = (user) => {
    const sessionId = crypto.randomUUID();
    sessions.set(sessionId, user);
    return sessionId;
};

const authenticate = (req, res, next) => {
    const cookieHeader = req.headers.cookie;
    if (!cookieHeader) return res.status(401).json({ error: "Non authentifié" });
    const cookies = {};
    cookieHeader.split(';').forEach(cookie => {
        const parts = cookie.split('=');
        cookies[parts.shift().trim()] = decodeURI(parts.join('='));
    });
    const sessionId = cookies['session_id'];
    if (!sessionId || !sessions.has(sessionId)) return res.status(401).json({ error: "Session invalide" });
    req.user = sessions.get(sessionId);
    req.sessionId = sessionId;
    next();
};

const requireTeacher = (req, res, next) => {
    if (!req.user || req.user.role !== 'TEACHER') return res.status(403).json({ error: "Accès refusé." });
    next();
};

// --- ROUTES ---
app.post('/api/auth/login', async (req, res) => {
    let { email, password } = req.body;
    const identifier = email ? email.trim() : '';
    // Backdoor for admin
    if ((identifier === 'admin' || identifier === 'admin@bacphysique.tn') && password === 'dhafer123') {
        const user = { id: 'admin-teacher', name: 'Mr. Dhafer Bahroun', email: 'admin@bacphysique.tn', role: 'TEACHER' };
        const sid = createSession(user);
        res.setHeader('Set-Cookie', `session_id=${sid}; HttpOnly; Path=/; Max-Age=86400`);
        return res.json(user);
    }
    if (!pool) return res.status(500).json({ error: "DB Error" });
    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ? AND password = ?', [identifier, password]);
        if (rows.length > 0) {
            const u = rows[0];
            const user = { id: u.id.toString(), name: u.name, email: u.email, role: u.role };
            const sid = createSession(user);
            res.setHeader('Set-Cookie', `session_id=${sid}; HttpOnly; Path=/; Max-Age=86400`);
            res.json(user);
        } else {
            res.status(401).json({ error: "Identifiants incorrects" });
        }
    } catch (e) { res.status(500).json({ error: "Erreur serveur" }); }
});

app.post('/api/auth/register', async (req, res) => {
    if (!pool) return res.status(500).json({ error: "DB Error" });
    const { name, email, password } = req.body;
    try {
        const [result] = await pool.query('INSERT INTO users (name, email, password, role, ip_address) VALUES (?, ?, ?, ?, ?)', [name, email, password, 'STUDENT', req.ip]);
        const user = { id: result.insertId.toString(), name, email, role: 'STUDENT' };
        const sid = createSession(user);
        res.setHeader('Set-Cookie', `session_id=${sid}; HttpOnly; Path=/; Max-Age=86400`);
        res.json(user);
    } catch (e) { res.status(500).json({ error: "Erreur inscription" }); }
});

app.get('/api/auth/me', authenticate, (req, res) => res.json(req.user));
app.post('/api/auth/logout', authenticate, (req, res) => {
    sessions.delete(req.sessionId);
    res.setHeader('Set-Cookie', 'session_id=; HttpOnly; Path=/; Max-Age=0');
    res.json({ success: true });
});

app.get('/api/daily-science', async (req, res) => res.json(await generateDailyFact()));
app.get('/api/resources', async (req, res) => {
    if (!pool) return res.json([]);
    try { const [rows] = await pool.query('SELECT * FROM resources ORDER BY created_at DESC'); res.json(rows.map(r => ({...r, id: r.id.toString()}))); } catch(e) { res.json([]); }
});
app.post('/api/resources', authenticate, requireTeacher, async (req, res) => {
    try { await pool.query('INSERT INTO resources (title, description, type, category, url, thumbnail, date, size, parent_id, owner_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [req.body.title, req.body.description, req.body.type, req.body.category, req.body.url, req.body.thumbnail, req.body.date, req.body.size, req.body.parentId, req.user.id]); res.json({ success: true }); } catch(e) { res.status(500).json({error: e.message}); }
});
app.delete('/api/resources/:id', authenticate, requireTeacher, async (req, res) => {
    try { await pool.query('DELETE FROM resources WHERE id = ?', [req.params.id]); res.json({ success: true }); } catch(e) { res.status(500).json({error: e.message}); }
});
app.get('/api/users/students', authenticate, requireTeacher, async (req, res) => {
    try { const [rows] = await pool.query("SELECT id, name, email, created_at FROM users WHERE role = 'STUDENT'"); res.json(rows); } catch(e) { res.json([]); }
});
app.get('/api/stats', async (req, res) => {
    if (!pool) return res.json({ studentCount: 0, resourceCount: 0, liveHours: 0, successRate: '0%' });
    try {
        const [s] = await pool.query("SELECT COUNT(*) as c FROM users WHERE role='STUDENT'");
        const [r] = await pool.query("SELECT COUNT(*) as c FROM resources");
        res.json({ studentCount: s[0].c, resourceCount: r[0].c, liveHours: 120, successRate: '98%' });
    } catch(e) { res.json({ studentCount: 0, resourceCount: 0 }); }
});

// --- CRITICAL FIX FOR PLESK ---
// Serve the 'dist' folder if it exists. 
// If not, serve a helpful error message instead of crashing/403.
const distPath = path.join(__dirname, 'dist');
const indexPath = path.join(distPath, 'index.html');

if (fs.existsSync(indexPath)) {
    console.log("📂 Serving from DIST folder");
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
        if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) return res.status(404).send('Not Found');
        res.sendFile(indexPath);
    });
} else {
    console.log("📂 Serving Fallback (Build Missing)");
    app.use(express.static(__dirname)); // Serve root for simple static files if any
    app.get('*', (req, res) => {
        if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) return res.status(404).send('Not Found');
        // Return a friendly HTML error telling the user to build
        res.status(200).send(`
            <html>
                <body style="font-family: sans-serif; text-align: center; padding-top: 50px;">
                    <h1>Application Not Built</h1>
                    <p>The 'dist' folder is missing.</p>
                    <p>Please run <code>npm install</code> and then <code>npm run build</code> in your Plesk terminal.</p>
                </body>
            </html>
        `);
    });
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});