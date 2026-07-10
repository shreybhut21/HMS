const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

// Set up static folder for uploads
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
app.use('/uploads', express.static(uploadsDir));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + req.user.id + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

const JWT_SECRET = 'supersecretjwtkey_medicare_demo';

// --- AUTHENTICATION ROUTES ---

app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, type } = req.body;
  if (!name || !email || !password || !type) return res.status(400).json({ error: 'All fields are required' });
  if (type === 'admin') return res.status(403).json({ error: 'Cannot register as admin' });

  try {
    const [existingUsers] = await db.query('SELECT email FROM users WHERE email = ?', [email]);
    const [existingPending] = await db.query('SELECT email FROM pending_hospitals WHERE email = ?', [email]);
    if (existingUsers.length > 0 || existingPending.length > 0) return res.status(409).json({ error: 'Email is already registered' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    if (type === 'hospital') {
      await db.query('INSERT INTO pending_hospitals (name, email, password) VALUES (?, ?, ?)', [name, email, hashedPassword]);
      return res.status(201).json({ message: 'Registration pending approval', pending: true });
    } else {
      const [result] = await db.query('INSERT INTO users (name, email, password, type) VALUES (?, ?, ?, ?)', [name, email, hashedPassword, 'patient']);
      const user = { id: result.insertId, name, email, type: 'patient' };
      const token = jwt.sign({ id: user.id, type: user.type }, JWT_SECRET, { expiresIn: '7d' });
      return res.status(201).json({ message: 'Registration successful', user, token, pending: false });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [pending] = await db.query('SELECT email FROM pending_hospitals WHERE email = ?', [email]);
    if (pending.length > 0) return res.status(403).json({ error: 'Your hospital account is still pending admin approval.' });

    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) return res.status(401).json({ error: 'Invalid email or password.' });

    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ error: 'Invalid email or password.' });

    let hospitalName = null;
    if (user.type !== 'hospital' && user.type !== 'patient' && user.type !== 'admin') {
      const [team] = await db.query('SELECT h.name FROM team_members tm JOIN users h ON tm.hospital_id = h.id WHERE tm.user_id = ?', [user.id]);
      if (team.length > 0) hospitalName = team[0].name;
    } else if (user.type === 'hospital') {
      hospitalName = user.name;
    }

    const token = jwt.sign({ id: user.id, type: user.type, hospitalName }, JWT_SECRET, { expiresIn: '7d' });
    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: { ...userWithoutPassword, hospitalName }, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Middleware to verify any authenticated user
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    console.log('verifyToken: No token provided');
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.log('verifyToken: Invalid or expired token:', err.message, 'Token received:', token);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// --- PATIENT ROUTES ---

app.get('/api/patient/profile', verifyToken, async (req, res) => {
  if (req.user.type !== 'patient') return res.status(403).json({ error: 'Patient access required' });
  try {
    const [profiles] = await db.query('SELECT * FROM patient_profiles WHERE user_id = ?', [req.user.id]);
    const [users] = await db.query('SELECT name, email FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ ...users[0], ...(profiles[0] || {}) });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Error fetching profile' });
  }
});

// Use multer for multipart form data
app.put('/api/patient/profile', verifyToken, upload.single('profile_photo_file'), async (req, res) => {
  if (req.user.type !== 'patient') return res.status(403).json({ error: 'Patient access required' });
  
  const { 
    name, phone, date_of_birth, gender, blood_group, height, weight, 
    medical_history, allergies, chronic_diseases, current_medications, past_surgeries 
  } = req.body;

  // Handle file upload
  let profile_photo = req.body.profile_photo; // fallback if sending URL string
  if (req.file) {
    profile_photo = `http://localhost:5000/uploads/${req.file.filename}`;
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    if (name) {
      await connection.query('UPDATE users SET name = ? WHERE id = ?', [name, req.user.id]);
    }

    const [profiles] = await connection.query('SELECT user_id FROM patient_profiles WHERE user_id = ?', [req.user.id]);
    
    if (profiles.length > 0) {
      await connection.query(
        `UPDATE patient_profiles SET 
         phone = ?, date_of_birth = ?, gender = ?, blood_group = ?, 
         height = ?, weight = ?, medical_history = ?, allergies = ?,
         profile_photo = ?, chronic_diseases = ?, current_medications = ?, past_surgeries = ?
         WHERE user_id = ?`,
        [phone, date_of_birth || null, gender, blood_group, height, weight, 
         medical_history, allergies, profile_photo, chronic_diseases, 
         current_medications, past_surgeries, req.user.id]
      );
    } else {
      await connection.query(
        `INSERT INTO patient_profiles 
         (user_id, phone, date_of_birth, gender, blood_group, height, weight, 
          medical_history, allergies, profile_photo, chronic_diseases, current_medications, past_surgeries) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [req.user.id, phone, date_of_birth || null, gender, blood_group, height, weight, 
         medical_history, allergies, profile_photo, chronic_diseases, current_medications, past_surgeries]
      );
    }

    await connection.commit();
    res.json({ message: 'Profile updated successfully', profile_photo });
  } catch (error) {
    await connection.rollback();
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Error updating profile' });
  } finally {
    connection.release();
  }
});

// GET /api/patient/dashboard
app.get('/api/patient/dashboard', verifyToken, async (req, res) => {
  if (req.user.type !== 'patient') return res.status(403).json({ error: 'Patient access required' });
  try {
    const [appointments] = await db.query(`
      SELECT a.id, a.hospital_id, DATE_FORMAT(a.appointment_date, '%Y-%m-%d') as appointment_date, a.appointment_time, a.status, a.created_at, a.token_number,
             hp.doctor_name, hp.image_url, u.name as hospital_name
      FROM appointments a
      JOIN users u ON a.hospital_id = u.id
      LEFT JOIN hospital_profiles hp ON a.hospital_id = hp.hospital_id
      WHERE a.patient_id = ?
      ORDER BY a.appointment_date ASC, a.appointment_time ASC
    `, [req.user.id]);
    res.json({ appointments });
  } catch (error) {
    console.error('Patient dashboard error:', error);
    res.status(500).json({ error: 'Error fetching patient dashboard' });
  }
});

// GET /api/patient/clinics
app.get('/api/patient/clinics', verifyToken, async (req, res) => {
  try {
    const [clinics] = await db.query(`
      SELECT u.id, u.name, u.email, hp.address, hp.doctor_name, hp.image_url, hp.degree
      FROM users u 
      LEFT JOIN hospital_profiles hp ON u.id = hp.hospital_id
      WHERE u.type = "hospital" 
      ORDER BY u.name ASC
    `);
    res.json(clinics);
  } catch (error) {
    console.error('Clinics fetch error:', error);
    res.status(500).json({ error: 'Error fetching clinics' });
  }
});

// GET /api/patient/clinics/:id
app.get('/api/patient/clinics/:id', verifyToken, async (req, res) => {
  try {
    const [clinics] = await db.query(`
      SELECT u.id, u.name, u.email, hp.address, hp.doctor_name, hp.degree, hp.experience, hp.description, hp.image_url
      FROM users u 
      LEFT JOIN hospital_profiles hp ON u.id = hp.hospital_id
      WHERE u.type = "hospital" AND u.id = ?
    `, [req.params.id]);
    
    if (clinics.length === 0) return res.status(404).json({ error: 'Clinic not found' });
    
    const [doctors] = await db.query(`
      SELECT tm.user_id as id, u.name, tm.specialization, tm.qualification, tm.experience, tm.consultation_fee,
             tm.gender, tm.medical_registration_number, tm.bio, tm.languages_spoken, tm.areas_of_expertise,
             tm.working_days, tm.available_time, tm.shift_timing
      FROM team_members tm
      JOIN users u ON tm.user_id = u.id
      WHERE tm.hospital_id = ? AND tm.role = 'Doctor'
    `, [req.params.id]);

    res.json({ ...clinics[0], doctors });
  } catch (error) {
    console.error('Clinic fetch error:', error);
    res.status(500).json({ error: 'Error fetching clinic details' });
  }
});

// POST /api/patient/appointments
app.post('/api/patient/appointments', verifyToken, async (req, res) => {
  if (req.user.type !== 'patient') return res.status(403).json({ error: 'Patient access required' });
  
  const { hospital_id, doctor_id, date, time, problem_description } = req.body;
  if (!hospital_id || !doctor_id || !date || !time || !problem_description) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // 1. Get or create queue for today
    await db.query(`
      INSERT INTO hospital_queues (hospital_id, doctor_id, queue_date, current_token, last_issued_token) 
      VALUES (?, ?, ?, 0, 1) 
      ON DUPLICATE KEY UPDATE last_issued_token = last_issued_token + 1
    `, [hospital_id, doctor_id, date]);

    // 2. Fetch the newly generated token
    const [queueRows] = await db.query(`SELECT last_issued_token FROM hospital_queues WHERE hospital_id = ? AND doctor_id = ? AND queue_date = ?`, [hospital_id, doctor_id, date]);
    const assignedToken = queueRows[0].last_issued_token;

    await db.query(
      'INSERT INTO appointments (patient_id, hospital_id, doctor_id, appointment_date, appointment_time, problem_description, token_number) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, hospital_id, doctor_id, date, time, problem_description, assignedToken]
    );
    res.status(201).json({ message: 'Appointment booked successfully', token_number: assignedToken });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ error: 'Error booking appointment' });
  }
});

// --- HOSPITAL ROUTES ---

// GET /api/hospital/:id/queue
app.get('/api/hospital/:id/queue', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const [queueRows] = await db.query(
      'SELECT current_token, last_issued_token FROM hospital_queues WHERE hospital_id = ? AND queue_date = ?',
      [req.params.id, today]
    );
    if (queueRows.length === 0) {
      return res.json({ current_token: 0, last_issued_token: 0 });
    }
    res.json(queueRows[0]);
  } catch (error) {
    console.error('Queue fetch error:', error);
    res.status(500).json({ error: 'Error fetching queue' });
  }
});

// GET /api/hospital/queue/me
app.get('/api/hospital/queue/me', verifyToken, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    let hospitalId = req.user.id;
    if (req.user.type !== 'hospital') {
      const [teamRows] = await db.query('SELECT hospital_id FROM team_members WHERE user_id = ?', [req.user.id]);
      if (teamRows.length > 0) {
        hospitalId = teamRows[0].hospital_id;
      } else {
        return res.json({ current_token: 0, last_issued_token: 0 });
      }
    }
    const [queueRows] = await db.query(
      'SELECT current_token, last_issued_token FROM hospital_queues WHERE hospital_id = ? AND queue_date = ?',
      [hospitalId, today]
    );
    if (queueRows.length === 0) {
      return res.json({ current_token: 0, last_issued_token: 0 });
    }
    res.json(queueRows[0]);
  } catch (error) {
    console.error('Queue fetch me error:', error);
    res.status(500).json({ error: 'Error fetching queue' });
  }
});

// POST /api/hospital/next-token
app.post('/api/hospital/next-token', verifyToken, async (req, res) => {
  if (req.user.type !== 'hospital' && req.user.type !== 'doctor') {
    return res.status(403).json({ error: 'Hospital access required' });
  }
  
  try {
    const today = new Date().toISOString().split('T')[0];
    
    let hospitalId = req.user.id;
    if (req.user.type !== 'hospital') {
      const [teamRows] = await db.query('SELECT hospital_id FROM team_members WHERE user_id = ?', [req.user.id]);
      if (teamRows.length > 0) {
        hospitalId = teamRows[0].hospital_id;
      } else {
        return res.status(403).json({ error: 'Not associated with a hospital' });
      }
    }

    const [queueRows] = await db.query(
      'SELECT current_token, last_issued_token FROM hospital_queues WHERE hospital_id = ? AND queue_date = ?',
      [hospitalId, today]
    );
    
    if (queueRows.length === 0) {
      return res.status(400).json({ error: 'No queue found for today' });
    }
    
    const { current_token, last_issued_token } = queueRows[0];
    
    if (current_token >= last_issued_token) {
      return res.status(400).json({ error: 'Queue is already complete' });
    }
    
    await db.query(
      'UPDATE hospital_queues SET current_token = current_token + 1 WHERE hospital_id = ? AND queue_date = ?',
      [hospitalId, today]
    );
    
    res.json({ message: 'Advanced to next token', next_token: current_token + 1 });
  } catch (error) {
    console.error('Next token error:', error);
    res.status(500).json({ error: 'Error advancing token' });
  }
});

// GET /api/hospital/team
app.get('/api/hospital/team', verifyToken, async (req, res) => {
  if (req.user.type !== 'hospital') return res.status(403).json({ error: 'Hospital access required' });
  try {
    const [team] = await db.query(`
      SELECT tm.*, u.name, u.email 
      FROM team_members tm
      JOIN users u ON tm.user_id = u.id
      WHERE tm.hospital_id = ?
      ORDER BY tm.created_at DESC
    `, [req.user.id]);
    res.json(team);
  } catch (error) {
    console.error('Fetch team error:', error);
    res.status(500).json({ error: 'Error fetching team members' });
  }
});

// POST /api/hospital/team
app.post('/api/hospital/team', verifyToken, async (req, res) => {
  if (req.user.type !== 'hospital') return res.status(403).json({ error: 'Hospital access required' });
  const { name, email, password, role, phone, specialization, qualification, experience, consultation_fee, shift_timing, department } = req.body;
  if (!name || !email || !password || !role) return res.status(400).json({ error: 'Missing required fields' });
  
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [existing] = await connection.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) throw new Error('Email already exists');
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const userType = role.toLowerCase(); // doctor, receptionist, nurse, pharmacist, manager
    
    const [userRes] = await connection.query(
      'INSERT INTO users (name, email, password, type) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, userType]
    );
    const userId = userRes.insertId;
    
    await connection.query(`
      INSERT INTO team_members (user_id, hospital_id, phone, role, specialization, qualification, experience, consultation_fee, shift_timing, department)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [userId, req.user.id, phone, role, specialization || null, qualification || null, experience || null, consultation_fee || null, shift_timing || null, department || null]);
    
    await connection.commit();
    res.status(201).json({ message: 'Team member created successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Create team member error:', error);
    res.status(500).json({ error: error.message || 'Error creating team member' });
  } finally {
    connection.release();
  }
});

// PATCH /api/hospital/team/:id/status
app.patch('/api/hospital/team/:id/status', verifyToken, async (req, res) => {
  if (req.user.type !== 'hospital') return res.status(403).json({ error: 'Hospital access required' });
  try {
    await db.query('UPDATE team_members SET status = ? WHERE user_id = ? AND hospital_id = ?', [req.body.status, req.params.id, req.user.id]);
    res.json({ message: 'Status updated' });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: 'Error updating status' });
  }
});

// DELETE /api/hospital/team/:id
app.delete('/api/hospital/team/:id', verifyToken, async (req, res) => {
  if (req.user.type !== 'hospital') return res.status(403).json({ error: 'Hospital access required' });
  try {
    await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ message: 'Team member deleted' });
  } catch (error) {
    console.error('Delete team error:', error);
    res.status(500).json({ error: 'Error deleting team member' });
  }
});


// GET /api/hospital/dashboard
app.get('/api/hospital/dashboard', verifyToken, async (req, res) => {
  try {
    let hospitalId = req.user.id;
    if (req.user.type !== 'hospital') {
      const [teamRows] = await db.query('SELECT hospital_id FROM team_members WHERE user_id = ?', [req.user.id]);
      if (teamRows.length > 0) hospitalId = teamRows[0].hospital_id;
    }
    
    // Fetch all appointments for this hospital
    const [appointments] = await db.query(`
      SELECT a.id, DATE_FORMAT(a.appointment_date, '%Y-%m-%d') as appointment_date, a.appointment_time, a.problem_description, a.status, 
             u.id as patient_id, u.name as patient_name, u.email as patient_email,
             pp.phone, pp.gender, pp.blood_group, pp.height, pp.weight,
             pp.medical_history, pp.allergies, pp.chronic_diseases, pp.current_medications
      FROM appointments a
      JOIN users u ON a.patient_id = u.id
      LEFT JOIN patient_profiles pp ON u.id = pp.user_id
      WHERE a.hospital_id = ?
      ORDER BY a.appointment_date ASC, a.appointment_time ASC
    `, [hospitalId]);

    // Calculate basic stats
    const todayAppointments = appointments.filter((a) => {
      const aptDate = new Date(a.appointment_date).toDateString();
      return aptDate === new Date().toDateString() && a.status === 'Approved';
    });

    const pendingRequests = appointments.filter((a) => a.status === 'Pending');
    
    // Unique patients
    const patientIds = new Set(appointments.map((a) => a.patient_name));

    res.json({
      stats: {
        todayAppointments: todayAppointments.length,
        pendingRequests: pendingRequests.length,
        totalPatients: patientIds.size,
        revenue: 0 // Placeholder until billing is implemented
      },
      appointments,
      todayAppointments,
      pendingRequests
    });
  } catch (error) {
    console.error('Dashboard fetch error:', error);
    res.status(500).json({ error: 'Error fetching dashboard data' });
  }
});

// PATCH /api/hospital/appointments/:id/status
app.patch('/api/hospital/appointments/:id/status', verifyToken, async (req, res) => {
  const { status } = req.body;
  if (!['Approved', 'Rejected', 'Completed', 'Cancelled'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    let hospitalId = req.user.id;
    if (req.user.type !== 'hospital') {
      const [teamRows] = await db.query('SELECT hospital_id FROM team_members WHERE user_id = ?', [req.user.id]);
      if (teamRows.length > 0) hospitalId = teamRows[0].hospital_id;
    }

    const [result] = await db.query(
      'UPDATE appointments SET status = ? WHERE id = ? AND hospital_id = ?',
      [status, req.params.id, hospitalId]
    );

    if (result.affectedRows === 0) return res.status(404).json({ error: 'Appointment not found' });
    res.json({ message: 'Status updated successfully' });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: 'Error updating appointment status' });
  }
});

// --- RECEPTIONIST / BILLING ROUTES ---

// GET /api/hospital/doctors
app.get('/api/hospital/doctors', verifyToken, async (req, res) => {
  try {
    let hospitalId = req.user.id;
    if (req.user.type !== 'hospital') {
      const [teamRows] = await db.query('SELECT hospital_id FROM team_members WHERE user_id = ?', [req.user.id]);
      if (teamRows.length > 0) hospitalId = teamRows[0].hospital_id;
    }
    const [doctors] = await db.query(`
      SELECT tm.user_id, u.name 
      FROM team_members tm 
      JOIN users u ON tm.user_id = u.id 
      WHERE tm.hospital_id = ? AND tm.role = 'Doctor'
    `, [hospitalId]);
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching doctors' });
  }
});

// POST /api/hospital/walkin
app.post('/api/hospital/walkin', verifyToken, async (req, res) => {
  const connection = await db.getConnection();
  try {
    let hospitalId = req.user.id;
    if (req.user.type !== 'hospital') {
      const [teamRows] = await db.query('SELECT hospital_id FROM team_members WHERE user_id = ?', [req.user.id]);
      if (teamRows.length > 0) hospitalId = teamRows[0].hospital_id;
    }

    const { name, phone, age, gender, doctor_id, reason } = req.body;
    if (!name || !phone || !doctor_id) return res.status(400).json({ error: 'Missing required fields' });

    await connection.beginTransaction();

    // Find or create patient
    let patientId;
    const [existing] = await connection.query('SELECT u.id FROM users u JOIN patient_profiles p ON u.id = p.user_id WHERE p.phone = ?', [phone]);
    if (existing.length > 0) {
      patientId = existing[0].id;
    } else {
      const tempEmail = `walkin_${Date.now()}@medicare.local`;
      const [userRes] = await connection.query('INSERT INTO users (name, email, password, type) VALUES (?, ?, ?, "patient")', [name, tempEmail, '']);
      patientId = userRes.insertId;
      await connection.query('INSERT INTO patient_profiles (user_id, phone, gender, date_of_birth) VALUES (?, ?, ?, ?)', [patientId, phone, gender || 'Other', null]);
    }

    // Assign Token
    const date = new Date().toISOString().split('T')[0];
    await connection.query(`
      INSERT INTO hospital_queues (hospital_id, doctor_id, queue_date, current_token, last_issued_token) 
      VALUES (?, ?, ?, 0, 1) 
      ON DUPLICATE KEY UPDATE last_issued_token = last_issued_token + 1
    `, [hospitalId, doctor_id, date]);

    const [queueRows] = await connection.query('SELECT last_issued_token FROM hospital_queues WHERE hospital_id = ? AND doctor_id = ? AND queue_date = ?', [hospitalId, doctor_id, date]);
    const assignedToken = queueRows[0].last_issued_token;

    // Create Appointment
    const [insertResult] = await connection.query(
      'INSERT INTO appointments (patient_id, hospital_id, doctor_id, appointment_date, appointment_time, problem_description, status, token_number) VALUES (?, ?, ?, ?, ?, ?, "Approved", ?)',
      [patientId, hospitalId, doctor_id, date, new Date().toTimeString().split(' ')[0].substring(0,5), reason || 'Walk-in', assignedToken]
    );

    const [newAppointment] = await connection.query(`
      SELECT a.*, u.name as patient_name, pp.phone
      FROM appointments a
      JOIN users u ON a.patient_id = u.id
      LEFT JOIN patient_profiles pp ON u.id = pp.user_id
      WHERE a.id = ?
    `, [insertResult.insertId]);

    await connection.commit();
    res.status(201).json(newAppointment[0]);
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ error: 'Walk-in registration failed' });
  } finally {
    connection.release();
  }
});

// GET /api/hospital/queues/all
app.get('/api/hospital/queues/all', verifyToken, async (req, res) => {
  try {
    let hospitalId = req.user.id;
    if (req.user.type !== 'hospital') {
      const [teamRows] = await db.query('SELECT hospital_id FROM team_members WHERE user_id = ?', [req.user.id]);
      if (teamRows.length > 0) hospitalId = teamRows[0].hospital_id;
    }
    const today = new Date().toISOString().split('T')[0];
    const [queues] = await db.query(`
      SELECT q.doctor_id, q.current_token, q.last_issued_token, u.name as doctor_name
      FROM hospital_queues q
      JOIN users u ON q.doctor_id = u.id
      WHERE q.hospital_id = ? AND q.queue_date = ?
    `, [hospitalId, today]);
    res.json(queues);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching queues' });
  }
});

// POST /api/hospital/queues/advance
app.post('/api/hospital/queues/advance', verifyToken, async (req, res) => {
  try {
    let hospitalId = req.user.id;
    if (req.user.type !== 'hospital') {
      const [teamRows] = await db.query('SELECT hospital_id FROM team_members WHERE user_id = ?', [req.user.id]);
      if (teamRows.length > 0) hospitalId = teamRows[0].hospital_id;
    }
    const { doctor_id, action } = req.body;
    const today = new Date().toISOString().split('T')[0];
    
    if (action === 'next') {
      await db.query('UPDATE hospital_queues SET current_token = current_token + 1 WHERE hospital_id = ? AND doctor_id = ? AND queue_date = ? AND current_token < last_issued_token', [hospitalId, doctor_id, today]);
    } else if (action === 'previous') {
      await db.query('UPDATE hospital_queues SET current_token = current_token - 1 WHERE hospital_id = ? AND doctor_id = ? AND queue_date = ? AND current_token > 0', [hospitalId, doctor_id, today]);
    }
    res.json({ message: 'Queue updated' });
  } catch (error) {
    res.status(500).json({ error: 'Error updating queue' });
  }
});

// GET /api/hospital/invoices
app.get('/api/hospital/invoices', verifyToken, async (req, res) => {
  try {
    let hospitalId = req.user.id;
    if (req.user.type !== 'hospital') {
      const [teamRows] = await db.query('SELECT hospital_id FROM team_members WHERE user_id = ?', [req.user.id]);
      if (teamRows.length > 0) hospitalId = teamRows[0].hospital_id;
    }
    const [invoices] = await db.query(`
      SELECT i.*, p.name as patient_name, d.name as doctor_name, pp.phone as patient_phone, i.prescription_uid, h.name as hospital_name, hp.phone as hospital_phone, hp.address as hospital_address
      FROM invoices i
      JOIN users p ON i.patient_id = p.id
      LEFT JOIN patient_profiles pp ON p.id = pp.user_id
      LEFT JOIN users d ON i.doctor_id = d.id
      LEFT JOIN users h ON i.hospital_id = h.id
      LEFT JOIN hospital_profiles hp ON i.hospital_id = hp.hospital_id
      WHERE i.hospital_id = ?
      ORDER BY i.created_at DESC
    `, [hospitalId]);
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching invoices' });
  }
});

// POST /api/hospital/invoices
app.post('/api/hospital/invoices', verifyToken, async (req, res) => {
  try {
    let hospitalId = req.user.id;
    if (req.user.type !== 'hospital') {
      const [teamRows] = await db.query('SELECT hospital_id FROM team_members WHERE user_id = ?', [req.user.id]);
      if (teamRows.length > 0) hospitalId = teamRows[0].hospital_id;
    }
    const { patient_id, patient_name, doctor_id, consultation_fee, additional_charges, discount } = req.body;
    const total = (Number(consultation_fee) || 0) + (Number(additional_charges) || 0) - (Number(discount) || 0);
    const invoiceNumber = 'INV-' + Math.floor(10000 + Math.random() * 90000);

    let pid = patient_id;
    if (!pid && patient_name) {
      const [existing] = await db.query('SELECT id FROM users WHERE name = ? AND type = "patient"', [patient_name]);
      if (existing.length > 0) {
        pid = existing[0].id;
      } else {
        const tempEmail = `inv_${Date.now()}@medicare.local`;
        const [userRes] = await db.query('INSERT INTO users (name, email, password, type) VALUES (?, ?, ?, "patient")', [patient_name, tempEmail, '']);
        pid = userRes.insertId;
      }
    }

    await db.query(`
      INSERT INTO invoices (invoice_number, hospital_id, patient_id, doctor_id, consultation_fee, additional_charges, discount, total_amount)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [invoiceNumber, hospitalId, pid, doctor_id || null, consultation_fee || 0, additional_charges || 0, discount || 0, total]);
    
    res.status(201).json({ message: 'Invoice created' });
  } catch (error) {
    res.status(500).json({ error: 'Error creating invoice' });
  }
});

// PUT /api/hospital/invoices/:id
app.put('/api/hospital/invoices/:id', verifyToken, async (req, res) => {
  try {
    const { consultation_fee, additional_charges, discount } = req.body;
    const total = (Number(consultation_fee) || 0) + (Number(additional_charges) || 0) - (Number(discount) || 0);
    await db.query(
      'UPDATE invoices SET consultation_fee = ?, additional_charges = ?, discount = ?, total_amount = ? WHERE id = ?',
      [consultation_fee || 0, additional_charges || 0, discount || 0, total, req.params.id]
    );
    res.json({ message: 'Invoice updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error updating invoice' });
  }
});

// PATCH /api/hospital/invoices/:id/pay
app.patch('/api/hospital/invoices/:id/pay', verifyToken, async (req, res) => {
  try {
    const { payment_method } = req.body;
    await db.query('UPDATE invoices SET status = "Paid", payment_method = ? WHERE id = ?', [payment_method, req.params.id]);
    res.json({ message: 'Payment collected' });
  } catch (error) {
    res.status(500).json({ error: 'Error collecting payment' });
  }
});

// --- ADMIN ROUTES ---
const verifyAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.type !== 'admin') return res.status(403).json({ error: 'Admin access required' });
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

app.get('/api/admin/pending', verifyAdmin, async (req, res) => {
  try {
    const [pending] = await db.query('SELECT id, name, email, created_at as date FROM pending_hospitals ORDER BY created_at DESC');
    res.json(pending);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching pending hospitals' });
  }
});

// GET /api/hospital/appointments
app.get('/api/hospital/appointments', verifyToken, async (req, res) => {
  try {
    let hospitalId = req.user.id;
    if (req.user.type !== 'hospital') {
      const [teamRows] = await db.query('SELECT hospital_id FROM team_members WHERE user_id = ?', [req.user.id]);
      if (teamRows.length > 0) hospitalId = teamRows[0].hospital_id;
    }

    const [appointments] = await db.query(`
      SELECT a.id, DATE_FORMAT(a.appointment_date, '%Y-%m-%d') as appointment_date, a.appointment_time, a.problem_description, a.status, a.token_number,
             u.id as patient_id, u.name as patient_name, u.email as patient_email, pp.gender, pp.phone, pp.blood_group, 
             pp.height, pp.weight, pp.medical_history, pp.allergies, pp.chronic_diseases, d.name as doctor_name
      FROM appointments a
      JOIN users u ON a.patient_id = u.id
      LEFT JOIN patient_profiles pp ON u.id = pp.user_id
      LEFT JOIN users d ON a.doctor_id = d.id
      WHERE a.hospital_id = ?
      ORDER BY a.appointment_date DESC, a.appointment_time DESC
    `, [hospitalId]);

    res.json(appointments);
  } catch (error) {
    console.error('Appointments fetch error:', error);
    res.status(500).json({ error: 'Error fetching appointments' });
  }
});

// GET /api/hospital/patients
app.get('/api/hospital/patients', verifyToken, async (req, res) => {
  try {
    let hospitalId = req.user.id;
    let doctorId = null;
    
    if (req.user.type === 'doctor') {
      doctorId = req.user.id;
      const [teamRows] = await db.query('SELECT hospital_id FROM team_members WHERE user_id = ?', [req.user.id]);
      if (teamRows.length > 0) hospitalId = teamRows[0].hospital_id;
    } else if (req.user.type !== 'hospital') {
      const [teamRows] = await db.query('SELECT hospital_id FROM team_members WHERE user_id = ?', [req.user.id]);
      if (teamRows.length > 0) hospitalId = teamRows[0].hospital_id;
    }

    let queryStr = `
      SELECT u.id, u.name, pp.phone, pp.gender, pp.blood_group, pp.medical_history, pp.allergies, pp.chronic_diseases, pp.current_medications, pp.past_surgeries,
             pp.height, pp.weight, pp.date_of_birth,
             MAX(a.appointment_date) as lastVisit,
             COUNT(a.id) as totalVisits
      FROM appointments a
      JOIN users u ON a.patient_id = u.id
      LEFT JOIN patient_profiles pp ON u.id = pp.user_id
      WHERE a.hospital_id = ? 
    `;
    const queryParams = [hospitalId];

    if (doctorId) {
      queryStr += ` AND a.doctor_id = ? `;
      queryParams.push(doctorId);
    }

    queryStr += `
      GROUP BY u.id
      ORDER BY lastVisit DESC
    `;

    const [patients] = await db.query(queryStr, queryParams);

    res.json(patients);
  } catch (error) {
    console.error('Patients fetch error:', error);
    res.status(500).json({ error: 'Error fetching patients' });
  }
});

// GET /api/hospital/prescriptions
app.get('/api/hospital/prescriptions', verifyToken, async (req, res) => {
  try {
    let hospitalId = req.user.id;
    if (req.user.type !== 'hospital') {
      const [teamRows] = await db.query('SELECT hospital_id FROM team_members WHERE user_id = ?', [req.user.id]);
      if (teamRows.length > 0) hospitalId = teamRows[0].hospital_id;
    }

    let queryStr = `
      SELECT p.id, p.prescription_uid, p.diagnosis, p.advice, p.follow_up_date, p.status, p.created_at,
             u.id as patient_id, u.name as patientName, pp.phone, pp.gender, pp.blood_group, pp.date_of_birth,
             d.name as doctor_name, tm.qualification as doctor_qualification, tm.medical_registration_number, tm.phone as doctor_phone,
             h.name as hospital_name, hp.address as hospital_address, hp.phone as hospital_phone
      FROM prescriptions p
      JOIN users u ON p.patient_id = u.id
      LEFT JOIN patient_profiles pp ON u.id = pp.user_id
      LEFT JOIN appointments a ON p.appointment_id = a.id
      LEFT JOIN users d ON a.doctor_id = d.id
      LEFT JOIN team_members tm ON a.doctor_id = tm.user_id
      LEFT JOIN users h ON p.hospital_id = h.id
      LEFT JOIN hospital_profiles hp ON p.hospital_id = hp.hospital_id
      WHERE p.hospital_id = ?
    `;
    const queryParams = [hospitalId];

    if (req.query.patient_id) {
      queryStr += ` AND p.patient_id = ?`;
      queryParams.push(req.query.patient_id);
    }
    
    queryStr += ` ORDER BY p.created_at DESC`;

    const [prescriptions] = await db.query(queryStr, queryParams);

    // Fetch medicines for each prescription
    // In a real prod environment, this should be a single JOIN or grouped query, 
    // but doing N queries is fine for the prototype.
    for (let p of prescriptions) {
      const [meds] = await db.query('SELECT * FROM prescription_medicines WHERE prescription_id = ?', [p.id]);
      p.medicines = meds;
    }

    res.json(prescriptions);
  } catch (error) {
    console.error('Prescriptions fetch error:', error);
    res.status(500).json({ error: 'Error fetching prescriptions' });
  }
});

// GET /api/hospital/prescriptions/secure/:uid
app.get('/api/hospital/prescriptions/secure/:uid', verifyToken, async (req, res) => {
  try {
    const uid = req.params.uid;
    const [prescriptions] = await db.query(`
      SELECT p.*, u.name as patient_name, d.name as doctor_name, h.name as hospital_name, a.appointment_date, a.appointment_time, pp.phone as patient_phone, hp.phone as hospital_phone, hp.address as hospital_address
      FROM prescriptions p
      JOIN users u ON p.patient_id = u.id
      LEFT JOIN patient_profiles pp ON u.id = pp.user_id
      LEFT JOIN appointments a ON p.appointment_id = a.id
      LEFT JOIN users d ON a.doctor_id = d.id
      LEFT JOIN users h ON p.hospital_id = h.id
      LEFT JOIN hospital_profiles hp ON p.hospital_id = hp.hospital_id
      WHERE p.prescription_uid = ?
    `, [uid]);
    
    if (prescriptions.length === 0) return res.status(404).json({ error: 'Prescription not found' });
    
    const prescription = prescriptions[0];
    
    // Allow if user is doctor or hospital or admin
    if (req.user.type !== 'hospital' && req.user.type !== 'doctor' && req.user.type !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to view this prescription securely' });
    }

    const [medicines] = await db.query(
      'SELECT * FROM prescription_medicines WHERE prescription_id = ?',
      [prescription.id]
    );
    
    res.json({ ...prescription, medicines });
  } catch (error) {
    console.error('Secure prescription fetch error:', error);
    res.status(500).json({ error: 'Error fetching prescription' });
  }
});

// POST /api/hospital/prescriptions
app.post('/api/hospital/prescriptions', verifyToken, async (req, res) => {
  const connection = await db.getConnection();
  try {
    let hospitalId = req.user.id;
    if (req.user.type !== 'hospital') {
      const [teamRows] = await db.query('SELECT hospital_id FROM team_members WHERE user_id = ?', [req.user.id]);
      if (teamRows.length > 0) hospitalId = teamRows[0].hospital_id;
    }

    const { patient_id, appointment_id, diagnosis, advice, follow_up_date, status, medicines, consultation_fee } = req.body;
    
    if (!patient_id || !diagnosis) {
      return res.status(400).json({ error: 'patient_id and diagnosis are required' });
    }

    await connection.beginTransaction();

    const prescription_uid = 'RX-' + Math.random().toString(36).substring(2, 9).toUpperCase();

    const [result] = await connection.query(`
      INSERT INTO prescriptions (prescription_uid, hospital_id, patient_id, appointment_id, diagnosis, advice, follow_up_date, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [prescription_uid, hospitalId, patient_id, appointment_id || null, diagnosis, advice || '', follow_up_date || null, status || 'Active']);

    const prescriptionId = result.insertId;

    if (medicines && Array.isArray(medicines)) {
      for (let med of medicines) {
        await connection.query(`
          INSERT INTO prescription_medicines (prescription_id, medicine_name, dosage, frequency, duration, instructions)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [prescriptionId, med.medicine_name, med.dosage, med.frequency, med.duration, med.instructions || '']);
      }
    }

    await connection.commit();

    if (consultation_fee && Number(consultation_fee) > 0) {
      const invoiceNumber = 'INV-' + Math.floor(10000 + Math.random() * 90000);
      await connection.query(`
        INSERT INTO invoices (invoice_number, hospital_id, patient_id, doctor_id, consultation_fee, additional_charges, discount, total_amount, status, prescription_uid)
        VALUES (?, ?, ?, ?, ?, 0, 0, ?, 'Pending', ?)
      `, [invoiceNumber, hospitalId, patient_id, req.user.id, consultation_fee, consultation_fee, prescription_uid]);
    }

    res.status(201).json({ message: 'Prescription saved successfully', id: prescriptionId, prescription_uid });
  } catch (error) {
    await connection.rollback();
    console.error('Prescription create error:', error);
    res.status(500).json({ error: 'Error creating prescription' });
  } finally {
    connection.release();
  }
});

app.post('/api/admin/approve/:id', verifyAdmin, async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [pendingRows] = await connection.query('SELECT * FROM pending_hospitals WHERE id = ?', [req.params.id]);
    if (pendingRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Pending hospital not found' });
    }
    const hospital = pendingRows[0];
    await connection.query('INSERT INTO users (name, email, password, type) VALUES (?, ?, ?, ?)', [hospital.name, hospital.email, hospital.password, 'hospital']);
    await connection.query('DELETE FROM pending_hospitals WHERE id = ?', [hospital.id]);
    await connection.commit();
    res.json({ message: 'Hospital approved successfully' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: 'Internal server error during approval' });
  } finally {
    connection.release();
  }
});

app.post('/api/admin/reject/:id', verifyAdmin, async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM pending_hospitals WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Pending hospital not found' });
    res.json({ message: 'Hospital rejected successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error during rejection' });
  }
});

const PORT = 5000;
// PUBLIC APIs (No Token Required)

// GET /api/public/invoices/:invoiceNumber
app.get('/api/public/invoices/:invoiceNumber', async (req, res) => {
  try {
    const { phone } = req.query;
    if (!phone) return res.status(400).json({ error: 'Phone number is required for verification' });

    const [invoices] = await db.query(`
      SELECT i.*, p.name as patient_name, d.name as doctor_name, h.name as hospital_name, pp.phone as patient_phone, hp.phone as hospital_phone, hp.address as hospital_address
      FROM invoices i
      JOIN users p ON i.patient_id = p.id
      LEFT JOIN patient_profiles pp ON p.id = pp.user_id
      LEFT JOIN users d ON i.doctor_id = d.id
      LEFT JOIN users h ON i.hospital_id = h.id
      LEFT JOIN hospital_profiles hp ON i.hospital_id = hp.hospital_id
      WHERE i.invoice_number = ?
    `, [req.params.invoiceNumber]);
    
    if (invoices.length === 0) return res.status(404).json({ error: 'Invoice not found' });
    
    if (invoices[0].patient_phone !== phone) {
      return res.status(401).json({ error: 'Verification failed. Incorrect phone number.' });
    }

    res.json(invoices[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching invoice' });
  }
});

// GET /api/public/prescriptions/:prescriptionUid
app.get('/api/public/prescriptions/:prescriptionUid', async (req, res) => {
  try {
    const { phone } = req.query;
    if (!phone) return res.status(400).json({ error: 'Phone number is required for verification' });

    let uid = req.params.prescriptionUid;
    
    // Support RX-{InvoiceNumber} format
    if (uid.startsWith('RX-') && !isNaN(uid.split('-')[1])) {
      const invoiceNum = 'INV-' + uid.split('-')[1];
      const [invRows] = await db.query('SELECT prescription_uid FROM invoices WHERE invoice_number = ?', [invoiceNum]);
      if (invRows.length > 0 && invRows[0].prescription_uid) {
        uid = invRows[0].prescription_uid;
      }
    }

    const [prescriptions] = await db.query(`
      SELECT p.*, u.name as patient_name, d.name as doctor_name, h.name as hospital_name, a.appointment_date, a.appointment_time, pp.phone as patient_phone, hp.phone as hospital_phone, hp.address as hospital_address
      FROM prescriptions p
      JOIN users u ON p.patient_id = u.id
      LEFT JOIN patient_profiles pp ON u.id = pp.user_id
      LEFT JOIN appointments a ON p.appointment_id = a.id
      LEFT JOIN users d ON a.doctor_id = d.id
      LEFT JOIN users h ON p.hospital_id = h.id
      LEFT JOIN hospital_profiles hp ON p.hospital_id = hp.hospital_id
      WHERE p.prescription_uid = ?
    `, [uid]);
    
    if (prescriptions.length === 0) return res.status(404).json({ error: 'Prescription not found' });
    
    const prescription = prescriptions[0];
    
    if (prescription.patient_phone !== phone) {
      return res.status(401).json({ error: 'Verification failed. Incorrect phone number.' });
    }

    const [medicines] = await db.query(
      'SELECT * FROM prescription_medicines WHERE prescription_id = ?',
      [prescription.id]
    );
    
    res.json({ ...prescription, medicines });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching prescription' });
  }
});

// GET /api/doctor/profile
app.get('/api/doctor/profile', verifyToken, async (req, res) => {
  try {
    if (req.user.type !== 'doctor') return res.status(403).json({ error: 'Access denied' });

    const [profiles] = await db.query(`
      SELECT 
        u.id, u.name, u.email, u.created_at,
        tm.phone, tm.role, tm.specialization, tm.qualification, tm.experience, 
        tm.consultation_fee, tm.working_days, tm.available_time, tm.shift_timing, 
        tm.department, tm.gender, tm.date_of_birth, tm.medical_registration_number, 
        tm.bio, tm.languages_spoken, tm.areas_of_expertise, tm.hospital_id,
        h.name as hospital_name
      FROM users u
      LEFT JOIN team_members tm ON u.id = tm.user_id
      LEFT JOIN users h ON tm.hospital_id = h.id
      WHERE u.id = ?
    `, [req.user.id]);

    if (profiles.length === 0) return res.status(404).json({ error: 'Doctor not found' });
    const profile = profiles[0];

    // Compute stats
    const [statsResult] = await db.query(`
      SELECT 
        (SELECT COUNT(DISTINCT patient_id) FROM appointments WHERE doctor_id = ?) as totalPatients,
        (SELECT COUNT(*) FROM appointments WHERE doctor_id = ? AND MONTH(appointment_date) = MONTH(CURRENT_DATE())) as appointmentsThisMonth,
        (SELECT COUNT(*) FROM prescriptions p JOIN appointments a ON p.appointment_id = a.id WHERE a.doctor_id = ?) as prescriptionsCreated
    `, [req.user.id, req.user.id, req.user.id]);
    
    profile.stats = {
      totalPatients: statsResult[0].totalPatients || 0,
      appointmentsThisMonth: statsResult[0].appointmentsThisMonth || 0,
      prescriptionsCreated: statsResult[0].prescriptionsCreated || 0,
      rating: 4.8 // Mock rating
    };

    res.json(profile);
  } catch (error) {
    console.error('Fetch doctor profile error:', error);
    res.status(500).json({ error: 'Error fetching profile' });
  }
});

// PUT /api/doctor/profile
app.put('/api/doctor/profile', verifyToken, async (req, res) => {
  try {
    if (req.user.type !== 'doctor') return res.status(403).json({ error: 'Access denied' });
    const { 
      name, phone, specialization, qualification, experience, 
      medical_registration_number, consultation_fee, department,
      gender, date_of_birth, bio, languages_spoken, areas_of_expertise,
      working_days, available_time
    } = req.body;

    await db.query('UPDATE users SET name = ? WHERE id = ?', [name, req.user.id]);
    
    // Check if team member exists
    const [existing] = await db.query('SELECT user_id FROM team_members WHERE user_id = ?', [req.user.id]);
    if (existing.length > 0) {
      await db.query(`
        UPDATE team_members SET 
          phone = ?, specialization = ?, qualification = ?, experience = ?,
          medical_registration_number = ?, consultation_fee = ?, department = ?,
          gender = ?, date_of_birth = ?, bio = ?, languages_spoken = ?, areas_of_expertise = ?,
          working_days = ?, available_time = ?
        WHERE user_id = ?
      `, [
        phone, specialization, qualification, experience,
        medical_registration_number, consultation_fee, department,
        gender, date_of_birth || null, bio, languages_spoken, areas_of_expertise,
        working_days, available_time,
        req.user.id
      ]);
    } else {
      await db.query(`
        INSERT INTO team_members (
          user_id, role, phone, specialization, qualification, experience,
          medical_registration_number, consultation_fee, department,
          gender, date_of_birth, bio, languages_spoken, areas_of_expertise,
          working_days, available_time
        ) VALUES (?, 'Doctor', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        req.user.id, phone, specialization, qualification, experience,
        medical_registration_number, consultation_fee, department,
        gender, date_of_birth || null, bio, languages_spoken, areas_of_expertise,
        working_days, available_time
      ]);
    }

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update doctor profile error:', error);
    res.status(500).json({ error: 'Error updating profile' });
  }
});

// PUT /api/doctor/profile/security
app.put('/api/doctor/profile/security', verifyToken, async (req, res) => {
  try {
    if (req.user.type !== 'doctor') return res.status(403).json({ error: 'Access denied' });
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.id]);
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password update error:', error);
    res.status(500).json({ error: 'Error updating password' });
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
