require('dotenv').config();
const cors=require('cors');
const express = require('express');
const mysql = require('mysql2');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const converter = require('number-to-words');
const PDFDocument = require('pdfkit');
const app = express();
const PORT = process.env.PORT || 3000;

// ====================== MIDDLEWARE ======================
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(__dirname));
app.use(cors());

// ====================== MULTER SETUP ======================
const uploadsDir = path.join(__dirname, 'uploads/');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

const paymentUploadsDir = path.join(__dirname, 'uploads/');
if (!fs.existsSync(paymentUploadsDir)) {
  fs.mkdirSync(paymentUploadsDir, { recursive: true });
}

const paymentStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueName = 'payment-' + Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const uploadPayment = multer({
  storage: paymentStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// ====================== DATABASE CONNECTION ======================
const db = mysql.createPool(process.env.MYSQL_PUBLIC_URL);

// ====================== ROUTES ======================

// Home Route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'mp.html'));
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

app.post('/register', upload.single('prof_img'), (req, res) => {
  const { name, email, contact, spswd, cpswd, role, comp_name } = req.body;
  const prof_img = req.file ? 'uploads/' + req.file.filename : null;
  if (spswd !== cpswd) {
    return res.status(400).json({
      success: false,
      message: 'Passwords do not match'
    });
  }
  let skills = req.body.skills || [];
  if (!Array.isArray(skills)) {
    skills = [skills];
  }
  const skillsJSON = JSON.stringify(skills);
  const sql = `
    INSERT INTO users 
    (name, prof_img, email, contact, spswd, cpswd, role, comp_name, skills)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  db.query(
    sql,
    [name, prof_img, email, contact, spswd, cpswd, role, comp_name, skillsJSON],
    (err, result) => {
      if (err) {
        console.error('DB Error:', err);
        return res.status(500).json({
          success: false,
          message: 'Database error'
        });
      }
      res.json({
        success: true,
        message: 'Registration successful!'
      });
    }
  );
});

// ====================== LOGIN ======================
app.post('/login', upload.none(), (req, res) => {
  const { emailOrContact, password } = req.body || {};

  if (!emailOrContact || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email/Contact and Password are required'
    });
  }

  const sql = `SELECT id, name, email, role, comp_name, prof_img
               FROM users
               WHERE (email = ? OR contact = ?) AND spswd = ?`;

  db.query(sql, [emailOrContact, emailOrContact, password], (err, results) => {
    if (err) {
      console.error('Database Error:', err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }

    if (results.length > 0) {
      res.json({
        success: true,
        message: 'Login successful',
        user: results[0]
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Invalid email/contact or password'
      });
    }
  });
});

// ====================== GET USER ======================
app.get('/api/me/:id', (req, res) => {
  const userId = req.params.id;
  const sql = `SELECT id, name, email, contact, role, comp_name, prof_img
               FROM users WHERE id = ?`;

  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false });
    }
    if (result.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, user: result[0] });
  });
});

// ====================== ADD LEAD ======================
app.post('/api/leads', (req, res) => {
  const data = req.body;
  const sql = `
    INSERT INTO leads (
      company_name, client_name, contact, alternate_contact,
      telephone, email, gst_no,
      flat_no, building_name, locality, city, pincode, state, maps_lnk,
      source_lead, industry_type,
      web_type, seo_type, smo_type, app_type, erp_type, services,
      service_notes,
      action_type,
      app_date, app_time, assign_emp, location,
      follow_date, follow_time, reason,
      additional_notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    data.company || null,
    data.client || null,
    data.contact || null,
    data.alt_contact || null,
    data.telephone || null,
    data.email || null,
    data.gst_no || null,
    data.flat_no || null,
    data.building_name || null,
    data.locality || null,
    data.city || null,
    data.pincode || null,
    data.state || null,
    data.maps_lnk || null,
    data.source_lead || null,
    data.industry_type || null,
    JSON.stringify(data.web_type || []),
    JSON.stringify(data.seo_type || []),
    JSON.stringify(data.smo_type || []),
    JSON.stringify(data.app_type || []),
    JSON.stringify(data.erp_type || []),
    JSON.stringify(data.services || []),
    data.service_notes || null,
    data.actionType || 'appointment',
    data.app_date || null,
    data.app_time || null,
    data.assign_emp || null,
    data.location || null,
    data.follow_date || null,
    data.follow_time || null,
    data.reason || null,
    data.additional_notes || null
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Lead Insert Error:", err);
      return res.status(500).json({
        success: false,
        message: "Error saving lead",
        error: err.sqlMessage
      });
    }
    console.log("Lead saved successfully, ID:", result.insertId);
    res.json({ success: true, message: "Lead saved successfully ✅" });
  });
});

// ====================== GET ALL LEADS ======================
app.get('/api/leads', (req, res) => {
  db.query("SELECT * FROM leads ORDER BY id DESC", (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false });
    }
    res.json({ success: true, data: result });
  });
});

// ====================== GET SINGLE LEAD ======================
app.get('/api/leads/:id', (req, res) => {
  const leadId = req.params.id;
  const sql = `SELECT * FROM leads WHERE id = ?`;

  db.query(sql, [leadId], (err, result) => {
    if (err) {
      console.error("Fetch Lead Error:", err);
      return res.status(500).json({ success: false });
    }
    if (result.length === 0) {
      return res.status(404).json({ success: false, message: "Lead not found" });
    }
    res.json({ success: true, data: result[0] });
  });
});

// ====================== UPDATE LEAD (Convert Followup to Appointment) ======================
app.put('/api/leads/:id', (req, res) => {
  const leadId = req.params.id;
  const { action_type, app_date, app_time, assign_emp, location } = req.body;

  const sql = `
    UPDATE leads
    SET action_type = ?,
        app_date = ?,
        app_time = ?,
        assign_emp = ?,
        location = ?
    WHERE id = ?
  `;

  db.query(sql, [action_type, app_date, app_time, assign_emp, location, leadId], (err, result) => {
    if (err) {
      console.error("Lead Update Error:", err);
      return res.status(500).json({ success: false, message: "Update failed" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Lead not found" });
    }
    res.json({ success: true, message: "Lead updated to Appointment" });
  });
});

// ====================== GET APPOINTMENTS ======================
app.get('/api/appointments', (req, res) => {
  const sql = `SELECT * FROM leads
               WHERE action_type = 'appointment'
               ORDER BY app_date ASC, app_time ASC`;

  db.query(sql, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false });
    }
    res.json({ success: true, data: result });
  });
});

// ====================== GET FOLLOWUPS ======================
app.get('/api/followups', (req, res) => {
  const sql = `SELECT * FROM leads
               WHERE action_type = 'followup'
               ORDER BY follow_date ASC, follow_time ASC`;

  db.query(sql, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false });
    }
    res.json({ success: true, data: result });
  });
});

// ====================== UPDATE LEAD ACTION (Not Interested / Followup / Deal Closed) ======================
app.put('/api/leads/:id/action', uploadPayment.single('paymentProof'), (req, res) => {
  const leadId = req.params.id;
  
  const {
    action,
    follow_date, follow_time, reason,
    payment_method, deal_amount, payment_notes,
    transaction_id, cheque_number, cheque_date,
    bank_name, branch_name, received_by, payment_date,
    closed_by
  } = req.body;

  const payment_proof = req.file ? 'uploads/' + req.file.filename : null;

  let sql = `UPDATE leads SET `;
  let values = [];

  if (action === 'not_interested') {
    sql += `lead_status = 'not_interested' WHERE id = ?`;
    values = [leadId];
  }
  else if (action === 'followup') {
    sql += `action_type = 'followup',
            follow_date = ?,
            follow_time = ?,
            reason = ?,
            lead_status = 'followup'
            WHERE id = ?`;
    values = [follow_date, follow_time, reason || null, leadId];
  }
  else if (action === 'deal_closed') {
    sql += `lead_status = 'deal_closed',
            closed_date = NOW(),
            closed_by = ?,
            payment_method = ?,
            deal_amount = ?,
            payment_notes = ?,
            transaction_id = ?,
            cheque_number = ?,
            cheque_date = ?,
            bank_name = ?,
            branch_name = ?,
            received_by = ?,
            payment_proof = ?,
            payment_date = ?,
            action_type = NULL
            WHERE id = ?`;
    
    values = [
      closed_by || null,
      payment_method || null,
      deal_amount || null,
      payment_notes || null,
      transaction_id || null,
      cheque_number || null,
      cheque_date || null,
      bank_name || null,
      branch_name || null,
      received_by || null,
      payment_proof,
      payment_date || null,
      leadId
    ];
  } else {
    return res.status(400).json({ success: false, message: "Invalid action" });
  }

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Action Update Error:", err);
      return res.status(500).json({
        success: false,
        message: "Database update failed",
        error: err.sqlMessage
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Lead not found" });
    }

    if (action === 'deal_closed') {
      const dealSql = `INSERT INTO deals
        (lead_id, deal_amount, payment_method, payment_notes, payment_proof, closed_by)
        VALUES (?, ?, ?, ?, ?, ?)`;
      db.query(dealSql, [leadId, deal_amount, payment_method, payment_notes || null, payment_proof, closed_by || null]);
    }

    res.json({
      success: true,
      message: "Lead updated successfully",
      payment_proof: payment_proof
    });
  });
});

// ====================== GET DEALS FOR EMPLOYEE ======================
app.get('/api/deals/:id', (req, res) => {
  const userId = req.params.id;

  const nameSql = `SELECT name FROM users WHERE id = ? AND role = 'me'`;
  db.query(nameSql, [userId], (err, userResult) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false });
    }

    if (userResult.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const employeeName = userResult[0].name;

    const sql = `
      SELECT * FROM leads
      WHERE lead_status = 'deal_closed'
      AND closed_by = ?
      ORDER BY closed_date DESC
    `;

    db.query(sql, [userId], (err, result) => {
      if (err) {
        console.error("Deals Fetch Error:", err);
        return res.status(500).json({ success: false });
      }
      res.json({ success: true, data: result });
    });
  });
});

// ====================== GET ME EMPLOYEES ======================
app.get('/api/me-employees', (req, res) => {
  const sql = `SELECT id, name FROM users WHERE role = 'me' ORDER BY name`;
  
  db.query(sql, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false });
    }
    res.json({ success: true, data: result });
  });
});

// ====================== GET AVAILABLE EMPLOYEES ======================
app.get('/api/available-employees', (req, res) => {
  const { date, time } = req.query;

  if (!date || !time) {
    return res.status(400).json({
      success: false,
      message: "Date and time required"
    });
  }

  const sql = `
    SELECT u.id, u.name
    FROM users u
    WHERE u.role = 'me'
    AND u.name NOT IN (
      SELECT assign_emp
      FROM leads
      WHERE action_type = 'appointment'
      AND app_date = ?
      AND app_time = ?
      AND assign_emp IS NOT NULL
    )
    ORDER BY u.name ASC
  `;

  db.query(sql, [date, time], (err, result) => {
    if (err) {
      console.error("Available Employees Error:", err);
      return res.status(500).json({
        success: false,
        message: "Server error while fetching employees"
      });
    }
    res.json({
      success: true,
      data: result
    });
  });
});

// ====================== GET APPOINTMENTS FOR SPECIFIC ME ======================
app.get('/api/appointments/:id', (req, res) => {
  const userId = req.params.id;

  const nameSql = `SELECT name FROM users WHERE id = ? AND role = 'me'`;
  db.query(nameSql, [userId], (err, userResult) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false });
    }

    if (userResult.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const employeeName = userResult[0].name;

    const sql = `
      SELECT * FROM leads
      WHERE action_type = 'appointment'
      AND assign_emp = ?
      ORDER BY app_date ASC, app_time ASC
    `;

    db.query(sql, [employeeName], (err, result) => {
      if (err) {
        console.error("Appointments Fetch Error:", err);
        return res.status(500).json({ success: false });
      }
      res.json({ success: true, data: result });
    });
  });
});

// ====================== GET FOLLOWUPS FOR SPECIFIC ME ======================
app.get('/api/followups/:id', (req, res) => {
  const userId = req.params.id;

  const nameSql = `SELECT name FROM users WHERE id = ? AND role = 'me'`;
  db.query(nameSql, [userId], (err, userResult) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false });
    }

    if (userResult.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const employeeName = userResult[0].name;

    const sql = `
      SELECT * FROM leads
      WHERE action_type = 'followup'
      AND assign_emp = ?
      ORDER BY follow_date ASC, follow_time ASC
    `;

    db.query(sql, [employeeName], (err, result) => {
      if (err) {
        console.error("FollowUps Fetch Error:", err);
        return res.status(500).json({ success: false });
      }
      res.json({ success: true, data: result });
    });
  });
});

// ====================== DEBUG ENDPOINT ======================
app.get('/api/debug/:id', (req, res) => {
  const userId = req.params.id;
  
  const nameSql = `SELECT id, name, email, role FROM users WHERE id = ?`;
  db.query(nameSql, [userId], (err, userResult) => {
    if (err) {
      return res.json({ success: false, error: err.message });
    }

    if (userResult.length === 0) {
      return res.json({ success: false, error: "User not found" });
    }

    const user = userResult[0];
    const employeeName = user.name;

    // Count data for this user
    const countSql = `
      SELECT 
        (SELECT COUNT(*) FROM leads WHERE assign_emp = ?) AS appointments_count,
        (SELECT COUNT(*) FROM leads WHERE action_type = 'followup' AND assign_emp = ?) AS followups_count,
        (SELECT COUNT(*) FROM leads WHERE lead_status = 'deal_closed' AND closed_by = ?) AS deals_count
    `;

    db.query(countSql, [employeeName, employeeName, userId], (err, countResult) => {
      if (err) {
        return res.json({ success: false, error: err.message });
      }

      res.json({ 
        success: true, 
        user: user,
        counts: countResult[0]
      });
    });
  });
});

// ====================== REPORTS COUNTS ======================
app.get('/api/reports/counts', (req, res) => {
  const sql = `
    SELECT
      (SELECT COUNT(*) FROM leads) AS total_leads,
      (SELECT COUNT(*) FROM leads WHERE action_type = 'appointment') AS total_appointments,
      (SELECT COUNT(*) FROM leads WHERE action_type = 'followup') AS total_followed
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Reports Count Error:", err);
      return res.status(500).json({ success: false, message: "Error fetching counts" });
    }

    res.json({
      success: true,
      data: {
        totalLeads: result[0].total_leads || 0,
        totalAppointments: result[0].total_appointments || 0,
        totalFollowed: result[0].total_followed || 0
      }
    });
  });
});

// ====================== ADMIN TEAM REPORT ======================
app.get('/api/admin/team-report', (req, res) => {
  const sql = `
    SELECT 
      u.id,
      u.name,
      u.email,
      u.role,
      COUNT(l.id) AS total_leads,
      SUM(CASE WHEN l.action_type = 'appointment' THEN 1 ELSE 0 END) AS total_appointments,
      SUM(CASE WHEN l.action_type = 'followup' THEN 1 ELSE 0 END) AS total_followups
    FROM users u
    LEFT JOIN leads l ON u.name = l.assign_emp 
                      OR (u.role = 'me' AND u.id = CAST(l.assign_emp AS UNSIGNED))
    WHERE u.role != 'admin'
    GROUP BY u.id, u.name, u.email, u.role
    ORDER BY u.role, u.name
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Team Report Error:", err);
      return res.status(500).json({ success: false, message: "Error fetching team report" });
    }
    res.json({ success: true, data: result });
  });
});

app.get('/api/projects', (req, res) => {
  const sql = `
    SELECT 
      id,
      company_name AS projectName,
      client_name AS client,
      web_type,
      seo_type,
      smo_type,
      app_type,
      erp_type,
      'Ongoing' AS status
    FROM leads 
    WHERE lead_status = 'deal_closed'
    AND pay_stat = 'received'
    ORDER BY closed_date DESC
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Projects Fetch Error:", err);
      return res.status(500).json({ success: false, message: "Server error" });
    }

    const projects = result.map(project => {
      let servicesList = [];

      const columns = [
        project.web_type,
        project.seo_type,
        project.smo_type,
        project.app_type,
        project.erp_type
      ];

      columns.forEach(value => {
        if (!value) return;

        try {
          let parsed = value;

          // 🔥 Step 1: agar string hai to parse karo
          if (typeof parsed === 'string') {
            parsed = JSON.parse(parsed);
          }

          // 🔥 Step 2: double JSON (important fix)
          if (typeof parsed === 'string') {
            parsed = JSON.parse(parsed);
          }

          // 🔥 Step 3: array ya string handle
          if (Array.isArray(parsed)) {
            servicesList = servicesList.concat(parsed);
          } else if (parsed && typeof parsed === 'string') {
            servicesList.push(parsed);
          }

        } catch (e) {
          // 🔥 fallback (agar parse fail ho)
          if (typeof value === 'string' && value.trim() !== '') {
            servicesList.push(value);
          }
        }
      });

      // 🔥 FINAL CLEANUP
      servicesList = [...new Set(
        servicesList
          .map(s => String(s).trim())
          .filter(s => 
            s !== '' && 
            s !== 'null' && 
            s !== 'undefined' &&
            s !== '[]'
          )
      )];

      const servicesText = servicesList.length > 0
        ? servicesList.join(', ')
        : 'No services selected';

        return {
          id: project.id,
          projectName: project.projectName,
          client: project.client,
          services: servicesText,
          status: project.status,
          web_type: project.web_type,
          seo_type: project.seo_type,
          smo_type: project.smo_type,
          app_type: project.app_type,
          erp_type: project.erp_type
        };
    });

    res.json({ success: true, data: projects });
  });
});

// ====================== AVAILABLE TEAM FOR PROJECT ASSIGNMENT ======================
app.get('/api/available-team', (req, res) => {
    const { services } = req.query;

    if (!services) {
        return res.json({ success: true, data: [] });
    }

    const service = String(services).toLowerCase().trim();
    
    const sql = `
        SELECT 
            u.id, 
            u.name,
            u.role,
            u.skills
        FROM users u
        WHERE LOWER(TRIM(u.role)) NOT IN ('me', 'tme', 'admin')
        AND u.skills IS NOT NULL
        ORDER BY u.name ASC
    `;

    db.query(sql, (err, result) => {
        if (err) {
            console.error("DB Error:", err);
            return res.json({ success: false, message: "DB Error" });
        }
        
        if (!result || result.length === 0) {
            console.log("No users found in DB");
            return res.json({ success: true, data: [] });
        }

        console.log(`Looking for service: ${service}`);
        console.log(`Found ${result.length} users in DB`);

        const filtered = result
            .filter(user => {
                try {
                    let skills = [];
                    
                    // Handle both JSON string and already-parsed object
                    if (typeof user.skills === 'string') {
                        skills = JSON.parse(user.skills);
                    } else if (Array.isArray(user.skills)) {
                        skills = user.skills;
                    } else if (user.skills && typeof user.skills === 'object') {
                        skills = user.skills;
                    } else {
                        return false;
                    }
                    
                    // Ensure it's an array
                    if (!Array.isArray(skills)) {
                        skills = [skills];
                    }
                    
                    const skillsLower = skills.map(s => String(s).toLowerCase().trim());
                    
                    console.log(`User ${user.name} (${user.id}) has skills:`, skillsLower);
                    
                    // Check for match
                    let hasMatch = false;
                    if (service === 'erp') {
                        hasMatch = skillsLower.includes('erp') || skillsLower.includes('erp_crm');
                    } else {
                        hasMatch = skillsLower.includes(service);
                    }
                    
                    if (hasMatch) {
                        console.log(`✓ ${user.name} matches ${service}`);
                    }
                    
                    return hasMatch;
                } catch (e) {
                    console.error(`Error processing user ${user.id}:`, e);
                    return false;
                }
            })
            .map(user => ({
                id: user.id,
                name: user.name,
                role: user.role
            }));

        console.log(`Returning ${filtered.length} users for service ${service}:`, filtered);
        
        res.json({
            success: true,
            data: filtered
        });
    });
});

app.post('/api/assign-project', (req, res) => {
  if (err) {
    return res.json({ success: false, message: "DB error" });
  }
  const { projectId, userId } = req.body;

  const checkSql = `SELECT * FROM project_assignments WHERE project_id = ?`;

  db.query(checkSql, [projectId], (err, result) => {
    if (result.length > 0) {
      return res.json({ success: false, message: "Already assigned" });
    }

    const insertSql = `
      INSERT INTO project_assignments (project_id, user_id)
      VALUES (?, ?)
    `;

    db.query(insertSql, [projectId, userId], (err2) => {
      if (err2) return res.json({ success: false });

      res.json({ success: true, message: "Assigned successfully" });
    });
  });
});

app.get('/api/check-assignment/:id', (req, res) => {
  const sql = `SELECT * FROM project_assignments WHERE project_id = ?`;

  db.query(sql, [req.params.id], (err, result) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    if (result && result.length > 0) {
      res.json({ assigned: true });
    } else {
      res.json({ assigned: false });
    }
  });
});

// ====================== GET PROJECTS FOR DEVELOPER (FINAL FIXED) ======================
app.get('/api/dev/projects/:userId', (req, res) => {
    const userId = parseInt(req.params.userId);

    const sql = `
        SELECT 
            l.id AS project_id,
            l.company_name AS projectName,
            l.client_name AS client,
            l.web_type,
            l.seo_type,
            l.smo_type,
            l.app_type,
            l.erp_type,
            COALESCE(pa.status, 'assigned') AS status,
            pa.assigned_at
        FROM project_assignments pa
        JOIN leads l ON pa.project_id = l.id
        WHERE pa.user_id = ?
        ORDER BY pa.assigned_at DESC
    `;

    db.query(sql, [userId], (err, result) => {
        if (err) {
            console.error("DEV Projects Fetch Error:", err);
            return res.status(500).json({ 
                success: false, 
                message: "Database error" 
            });
        }

        // Services parsing (same as before)
        const projects = result.map(project => {
            let servicesList = [];

            const columns = [project.web_type, project.seo_type, project.smo_type, project.app_type, project.erp_type];

            columns.forEach(value => {
                if (!value) return;
                try {
                    let parsed = typeof value === 'string' ? JSON.parse(value) : value;
                    if (typeof parsed === 'string') parsed = JSON.parse(parsed);

                    if (Array.isArray(parsed)) {
                        servicesList = servicesList.concat(parsed);
                    } else if (parsed) {
                        servicesList.push(String(parsed));
                    }
                } catch (e) {
                    if (typeof value === 'string' && value.trim()) {
                        servicesList.push(value.trim());
                    }
                }
            });

            const servicesText = [...new Set(
                servicesList.map(s => String(s).trim()).filter(s => s && s !== 'null' && s !== 'undefined')
            )].join(', ') || 'No services';

            return {
                project_id: project.project_id,
                projectName: project.projectName,
                client: project.client,
                services: servicesText,
                status: project.status.toLowerCase()   // 'assigned', 'ongoing', 'completed'
            };
        });

        console.log(`✅ DEV ID ${userId} ke liye ${projects.length} projects fetched`);

        // 🔥 Ab hum frontend ke hisaab se response bhej rahe hain
        res.json({
            success: true,
            assigned: projects.filter(p => p.status === 'assigned'),
            ongoing:  projects.filter(p => p.status === 'ongoing'),
            completed: projects.filter(p => p.status === 'completed')
        });
    });
});

app.get('/api/invoice/:id', (req, res) => {
  const leadId = req.params.id;

  const sql = `SELECT * FROM leads WHERE id = ?`;

  db.query(sql, [leadId], (err, result) => {
    if (err || result.length === 0) {
      return res.status(404).send("Lead not found");
    }

    const data = result[0];

    const PDFDocument = require('pdfkit');
    const path = require('path');
    const converter = require('number-to-words');

    const doc = new PDFDocument({ size: 'A4', margin: 40 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice_${leadId}.pdf`);

    doc.pipe(res);

    const pageWidth = doc.page.width;
    const margin = doc.page.margins.left;

    const logoPath = path.join(__dirname, 'logo.png');
    const qrPath = path.join(__dirname, 'Qr.jpeg');
    const fontPath = path.join(__dirname, 'fonts/NotoSans-Regular.ttf');
doc.font(fontPath);
const RS = "\u20B9";

    

    // ================= LOGO =================
    try {
      doc.image(logoPath, margin, 20, {
        width: pageWidth - (margin * 2)
      });
    } catch {}

    let y = 150;

    // ================= COMPANY =================
    doc.fontSize(9).text("METRICSMART INFOLINE PRIVATE LIMITED", margin, y);
    doc.text("GSTIN: 27AANCM9265F1ZY", margin, y + 12);
    doc.text("Mumbai, Maharashtra - 400104", margin, y + 24);

    // ================= INVOICE =================
    doc.text(`Invoice #: PFI-${leadId}`, 350, y);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 350, y + 12);
    doc.text(`Due Date: ${new Date().toLocaleDateString()}`, 350, y + 24);

    y += 60;

    // ================= CUSTOMER =================
    doc.rect(margin, y, pageWidth - (margin * 2), 60).stroke();

    doc.text("Customer Details:", margin + 5, y + 5);
    doc.text(data.company_name || '', margin + 5, y + 20);
    doc.text(data.client_name || '', 200, y + 20);
    doc.text(`Ph: ${data.contact || ''}`, 350, y + 20);
    doc.text(`${data.locality || ''}, ${data.city || ''}`, margin + 5, y + 35);

    y += 80;

    // ================= TABLE =================
    const tableX = margin;
    const tableWidth = pageWidth - (margin * 2);

    doc.rect(tableX, y, tableWidth, 20).fill("#0bb39c");

    doc.fillColor("#fff")
      .fontSize(8)
      .text("#", tableX + 5, y + 5)
      .text("Item", tableX + 25, y + 5)
      .text("Rate", tableX + 200, y + 5)
      .text("Qty", tableX + 260, y + 5)
      .text("Taxable", tableX + 320, y + 5)
      .text("Tax", tableX + 400, y + 5)
      .text("Amount", tableX + 460, y + 5);

    doc.fillColor("#000");
    y += 20;

    let services = [];

    if (data.seo_type) services.push("SEO");
    if (data.smo_type) services.push("SMO");
    if (data.web_type) services.push("Website Development");
    if (data.app_type) services.push("App Development");

    const descriptions = {
      SEO: "Boost your local business visibility with our expert GMB SEO service.",
      SMO: "Media management and social presence optimization.",
      "Website Development": "Dynamic scalable websites using PHP.",
      "App Development": "Custom mobile app solutions."
    };

    const amount = Number(data.deal_amount || 0);
    const perService = services.length ? amount / services.length : amount;

    services.forEach((s, i) => {

      const desc = descriptions[s] || '';

      // 👇 calculate height for item + desc
      const text = s + "\n" + desc;

      const textHeight = doc.heightOfString(text, {
        width: 150
      });

      const rowHeight = Math.max(30, textHeight + 10); // dynamic

      doc.rect(tableX, y, tableWidth, rowHeight).stroke();

      doc.fontSize(8)
        .text(i + 1, tableX + 5, y + 5)
        .text(text, tableX + 25, y + 5, {
          width: 150
        })
        .text(`${RS}${perService.toFixed(0)}`, tableX + 200, y + 5)
        .text("1", tableX + 260, y + 5)
        .text(`${RS}${perService.toFixed(0)}`, tableX + 320, y + 5)
        .text(`${RS}${(perService * 0.18).toFixed(0)}`, tableX + 400, y + 5)
        .text(`${RS}${(perService * 1.18).toFixed(0)}`, tableX + 460, y + 5);

      y += rowHeight;
    });

    // ================= TOTAL =================
    const taxable = amount * 0.82;
    const cgst = amount * 0.09;
    const sgst = amount * 0.09;

    y += 20;

    doc.text(`Taxable Amount: ${RS}${taxable.toFixed(2)}`, 350, y);
    doc.text(`CGST 9%: ${RS}${cgst.toFixed(2)}`, 350, y + 12);
    doc.text(`SGST 9%: ${RS}${sgst.toFixed(2)}`, 350, y + 24);

    doc.fontSize(10)
      .text(`TOTAL: ${RS}${amount.toFixed(2)}`, 350, y + 40);

    doc.fontSize(8)
      .text(`In Words: ${converter.toWords(amount)} Rupees Only`, margin, y + 20);

    // ================= BANK + QR =================
    y += 80;

    doc.rect(margin, y, tableWidth, 120).stroke();

    try {
      doc.image(qrPath, margin + 10, y + 10, {
        width: 90
      });
    } catch {}

    doc.fontSize(8)
      .text("Bank: Kotak Mahindra Bank", margin + 120, y + 15)
      .text("A/C: 5145057933", margin + 120, y + 35)
      .text("IFSC: KKBK0001379", margin + 120, y + 55);

    doc.text("Authorized Signatory", 400, y + 90);

    // ================= NOTES =================
    y += 130;

    doc.fontSize(9).text("Notes:", margin, y);
    doc.fontSize(8)
      .text("This pro forma invoice details the estimated charges for GMB SEO and Instagram management services.", margin, y + 15)
      .text("Website balance payment is updated in the invoice.", margin, y + 30);

    doc.end();
  });
});

// ====================== UPDATE PAYMENT STATUS ======================
app.put('/api/payment-status/:id', (req, res) => {
  const leadId = req.params.id;
  const { pay_stat } = req.body;

  if (!['pending', 'received', 'failed'].includes(pay_stat)) {
    return res.status(400).json({
      success: false,
      message: "Invalid payment status"
    });
  }

  const sql = `UPDATE leads SET pay_stat = ? WHERE id = ?`;

  db.query(sql, [pay_stat, leadId], (err, result) => {
    if (err) {
      console.error("Payment Status Update Error:", err);
      return res.status(500).json({
        success: false,
        message: "Database error"
      });
    }

    res.json({
      success: true,
      message: "Payment status updated successfully"
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port : ${PORT}`);
});

