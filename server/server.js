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
      const token = jwt.sign({ id: user.id, type: user.type }, JWT_SECRET, { expiresIn: '1d' });
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

    const token = jwt.sign({ id: user.id, type: user.type }, JWT_SECRET, { expiresIn: '1d' });
    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Middleware to verify any authenticated user
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
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
      SELECT a.id, a.appointment_date, a.appointment_time, a.status, a.created_at,
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
    res.json(clinics[0]);
  } catch (error) {
    console.error('Clinic fetch error:', error);
    res.status(500).json({ error: 'Error fetching clinic details' });
  }
});

// POST /api/patient/appointments
app.post('/api/patient/appointments', verifyToken, async (req, res) => {
  if (req.user.type !== 'patient') return res.status(403).json({ error: 'Patient access required' });
  
  const { hospital_id, date, time, problem_description } = req.body;
  if (!hospital_id || !date || !time || !problem_description) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    await db.query(
      'INSERT INTO appointments (patient_id, hospital_id, appointment_date, appointment_time, problem_description) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, hospital_id, date, time, problem_description]
    );
    res.status(201).json({ message: 'Appointment booked successfully' });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ error: 'Error booking appointment' });
  }
});

// --- HOSPITAL ROUTES ---

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
  if (req.user.type !== 'hospital') return res.status(403).json({ error: 'Hospital access required' });

  try {
    const hospitalId = req.user.id;
    
    // Fetch all appointments for this hospital
    const [appointments] = await db.query(`
      SELECT a.id, a.appointment_date, a.appointment_time, a.problem_description, a.status, 
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
  if (req.user.type !== 'hospital') return res.status(403).json({ error: 'Hospital access required' });
  
  const { status } = req.body;
  if (!['Approved', 'Rejected', 'Completed', 'Cancelled'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    const [result] = await db.query(
      'UPDATE appointments SET status = ? WHERE id = ? AND hospital_id = ?',
      [status, req.params.id, req.user.id]
    );

    if (result.affectedRows === 0) return res.status(404).json({ error: 'Appointment not found' });
    res.json({ message: 'Status updated successfully' });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: 'Error updating appointment status' });
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
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
