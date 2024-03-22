import express from 'express';
import con from "../Utils/db.js";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt';

const router = express.Router();

router.post("/student_login", (req, res) => {
    const sql = "SELECT * from student Where email = ?";
    con.query(sql, [req.body.email], (err, result) => {
        if (err) {
            console.error("Error executing SQL query:", err);
            return res.status(500).json({ loginStatus: false, Error: "Internal Server Error" });
        }
        if (result.length > 0) {
            bcrypt.compare(req.body.password, result[0].password, (err, response) => {
                if (err) {
                    console.error("Error comparing passwords:", err);
                    return res.status(500).json({ loginStatus: false, Error: "Internal Server Error" });
                }
                if (response) {
                    const email = result[0].email;
                    const token = jwt.sign(
                        { role: "employee", email: email, id: result[0].id },
                        "jwt_secret_key",
                        { expiresIn: "1d" }
                    );
                    res.cookie('token', token);
                    return res.json({ loginStatus: true, id: result[0].id });
                } else {
                    return res.json({ loginStatus: false, Error: "Wrong Password" });
                }
            });
        } else {
            return res.json({ loginStatus: false, Error: "Wrong email or password" });
        }
    });
});

router.get('/detail/:id', (req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM student where id = ?";
    con.query(sql, [id], (err, result) => {
        if (err) {
            console.error("Error executing SQL query:", err);
            return res.status(500).json({ Status: false, Error: "Internal Server Error" });
        }
        return res.json(result);
    });
});

router.get('/logout', (req, res) => {
    res.clearCookie('token');
    return res.json({ Status: true });
});

// Update student address by ID
router.put("/update_address/:id", (req, res) => {
  const id = req.params.id;
  const { address } = req.body;
  const sql = "UPDATE student SET address = ? WHERE id = ?";
  con.query(sql, [address, id], (err, result) => {
      if (err) {
          console.error("Error updating student address:", err);
          return res.status(500).json({ Status: false, Error: "Internal Server Error" });
      }
      return res.json({ Status: true, Message: "Student address updated successfully" });
  });
});

export { router as EmployeeRouter };
