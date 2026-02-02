import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import pg from 'pg';

const { Pool } = pg;

// --- DATABASE CONFIGURATION ---
const connectionString = 'postgresql://dbphysique_user:YQBnqTKQamBcOrrEUpbMwCiITwetoD9c@dpg-d5vq9sfpm1nc73cqq410-a/dbphysique';

const pool = new Pool({
  connectionString,
  // ssl: { rejectUnauthorized: false } 
});

const initDB = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        
        await pool.query(`
            CREATE TABLE IF NOT EXISTS resources (
                id SERIAL PRIMARY KEY,
                title TEXT NOT NULL,
                description TEXT,
                type TEXT NOT NULL,
                category TEXT,
                url TEXT,
                date TEXT,
                size TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("✅ Database initialized successfully");
    } catch (err) {
        console.error("❌ Database initialization failed:", err);
    }
};

initDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer(app);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.set('trust proxy', 1);

const io = new Server(server, {
  cors: {
    origin: [
        "http://localhost:5173", 
        "http://localhost:3000",
        /\.onrender\.com$/
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(express.static(path.join(__dirname, 'dist')));

// --- SINGLE ADMIN LOCK STATE ---
// We track the active socket ID of the admin. 
// If an admin tries to login while another socket is active, we deny.
let adminSocketId = null;

// --- API ROUTES ---

// 1. Auth: Login
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        // Admin Check
        if (email === 'admin@bacphysique.tn' && password === 'dhafer123') {
             // Check if already logged in via Socket
             if (adminSocketId) {
                // Verify if the socket is actually still connected
                const sock = io.sockets.sockets.get(adminSocketId);
                if (sock && sock.connected) {
                    return res.status(403).json({ error: "Un administrateur est déjà connecté." });
                } else {
                    // Stale socket, reset
                    adminSocketId = null;
                }
             }

             return res.json({
                id: 'admin-teacher',
                name: 'Mr. Dhafer Bahroun',
                email: 'admin@bacphysique.tn',
                role: 'TEACHER'
            });
        }

        const result = await pool.query('SELECT * FROM users WHERE email = $1 AND password = $2', [email, password]);
        if (result.rows.length > 0) {
            const u = result.rows[0];
            res.json({ id: u.id.toString(), name: u.name, email: u.email, role: u.role });
        } else {
            res.status(401).json({ error: "Identifiants incorrects" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Auth: Register (With Formspree)
app.post('/api/auth/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const check = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (check.rows.length > 0) {
            return res.status(400).json({ error: "Email déjà utilisé" });
        }

        const result = await pool.query(
            'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, email, password, 'STUDENT']
        );
        const u = result.rows[0];

        // --- FORMSPREE INTEGRATION ---
        // Send data to Formspree asynchronously (don't block response)
        fetch('https://formspree.io/f/xqelqgwr', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: u.name,
                email: u.email,
                date: new Date().toISOString()
            })
        }).catch(err => console.error("Formspree Error:", err));
        // -----------------------------

        res.json({ id: u.id.toString(), name: u.name, email: u.email, role: u.role });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/users/students', async (req, res) => {
    try {
        const result = await pool.query("SELECT id, name, email, created_at FROM users WHERE role = 'STUDENT' ORDER BY created_at DESC");
        const students = result.rows.map(row => ({
            id: row.id.toString(),
            name: row.name,
            email: row.email,
            date: new Date(row.created_at).toLocaleDateString(),
            interest: "Physique"
        }));
        res.json(students);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/resources', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM resources ORDER BY created_at DESC');
        const resources = result.rows.map(r => ({
            ...r,
            id: r.id.toString()
        }));
        res.json(resources);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/resources', async (req, res) => {
    const { title, description, type, category, url, date, size } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO resources (title, description, type, category, url, date, size) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [title, description, type, category, url, date, size]
        );
        const r = result.rows[0];
        res.json({ ...r, id: r.id.toString() });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/resources/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM resources WHERE id = $1', [id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// --- SERVER-SIDE MEMORY STATE ---
let isLive = false;
let onlineUsers = []; 
let mutedUsers = new Set(); // Stores socketIDs of muted users

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  socket.emit('status-update', isLive);

  socket.on('user-login', (userData) => {
    // If Admin, lock the session
    if (userData.role === 'TEACHER') {
        adminSocketId = socket.id;
    }

    onlineUsers = onlineUsers.filter(u => u.userId !== userData.id);
    onlineUsers.push({
      socketId: socket.id,
      ...userData
    });
    io.emit('online-users-update', onlineUsers);
  });

  socket.on('set-live-status', (status) => {
    isLive = status;
    io.emit('status-update', isLive);
    // Clear muted users when live stops? Maybe
    if (!status) mutedUsers.clear();
  });

  // --- LIVE MODERATION (KICK & MUTE) ---
  socket.on('kick-user', (targetSocketId) => {
      // Only allow if sender is admin (check against adminSocketId or onlineUsers role)
      const sender = onlineUsers.find(u => u.socketId === socket.id);
      if (sender && sender.role === 'TEACHER') {
          io.to(targetSocketId).emit('force-disconnect');
          // Disconnect socket from server side
          const targetSocket = io.sockets.sockets.get(targetSocketId);
          if (targetSocket) targetSocket.disconnect();
      }
  });

  socket.on('mute-user', (targetSocketId) => {
      const sender = onlineUsers.find(u => u.socketId === socket.id);
      if (sender && sender.role === 'TEACHER') {
          if (mutedUsers.has(targetSocketId)) {
              mutedUsers.delete(targetSocketId);
          } else {
              mutedUsers.add(targetSocketId);
          }
      }
  });

  socket.on('join-room', (roomId, user) => {
    socket.join(roomId);
    socket.to(roomId).emit('user-connected', {
        socketId: socket.id,
        ...user
    });

    socket.on('send-message', (message) => {
      // Check if user is muted
      if (mutedUsers.has(socket.id)) {
          // Optionally notify the user they are muted
          socket.emit('error-message', "Vous êtes muet pour le moment.");
          return;
      }
      socket.to(roomId).emit('receive-message', message);
    });
  });

  socket.on('disconnect', () => {
    if (socket.id === adminSocketId) {
        adminSocketId = null;
    }
    onlineUsers = onlineUsers.filter(u => u.socketId !== socket.id);
    mutedUsers.delete(socket.id);
    io.emit('online-users-update', onlineUsers);
    socket.broadcast.emit('user-disconnected', socket.id);
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});