import express from "express";
import con from "../Utils/db.js";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt'
import multer from "multer";
import path from "path";

const router = express.Router();


router.post("/adminlogin", (req, res) => {
    const { email, password } = req.body;
    // Query admin table
    const adminQuery = "SELECT * FROM admin WHERE email = ? AND password = ?";
    con.query(adminQuery, [email, password], (adminErr, adminResult) => {
      if (adminErr) return res.json({ loginStatus: false, Error: "Query error" });
      if (adminResult.length > 0) {
        const token = jwt.sign(
          { role: "admin", email: email, id: adminResult[0].id },
          "jwt_secret_key",
          { expiresIn: "1d" }
        );
        res.cookie('token', token)
        return res.json({ loginStatus: true, id: adminResult[0].id });
      } else {
        // If not found in admin table, query teacher table
        const teacherQuery = "SELECT * FROM employee WHERE email = ? AND password = ?";
        con.query(teacherQuery, [email, password], (teacherErr, teacherResult) => {
          if (teacherErr) return res.json({ loginStatus: false, Error: "Query error" });
          if (teacherResult.length > 0) {
            const token = jwt.sign(
              { role: "employee", email: email, id: teacherResult[0].id },
              "jwt_secret_key",
              { expiresIn: "1d" }
            );
            res.cookie('token', token)
            return res.json({ loginStatus: true, id: teacherResult[0].id });
          } else {
            return res.json({ loginStatus: false, Error: "Wrong email or password" });
          }
        });
      }
    });
  });
 
  
//Course CRUD function

router.get('/course', (req, res) => {
    const sql = "SELECT * FROM course";
    con.query(sql, (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"})
        return res.json({Status: true, Result: result})
    })
})

router.post('/add_course', (req, res) => {
    const sql = "INSERT INTO course (`name`) VALUES (?)"
    con.query(sql, [req.body.course], (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"})
        return res.json({Status: true})
    })
})

router.delete('/delete_course/:id', (req, res) => {
    const id = req.params.id;
    const sql = "delete from course where id = ?"
    con.query(sql,[id], (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"+err})
        return res.json({Status: true, Result: result})
    })
})

router.get('/course', (req, res) => {
    const sql = "SELECT * FROM course";
    con.query(sql, (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"})
        return res.json({Status: true, Result: result})
    })
})

// image upload 
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'Public/Images')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname))
    }
})
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
    fileFilter: (req, file, cb) => {
      if (file.fieldname === 'image') {
        cb(null, true);
      } else {
        cb(new Error('Invalid field name'), false);
      }
    }
  });
// end image upload 

//Teachers CRUD funtion

//Add teacher
router.post('/add_employee',upload.single('image'), (req, res) => {
    const sql = `INSERT INTO employee 
    (name,email,password, department, address, image, course_id) 
    VALUES (?)`;
    bcrypt.hash(req.body.password, 10, (err, hash) => {
        if(err) return res.json({Status: false, Error: "Query Error"})
        const values = [
            req.body.name,
            req.body.email,
            hash,
            req.body.department, 
            req.body.address,
            req.file.filename,//image
            req.body.course_id
        ]
        con.query(sql, [values], (err, result) => {
            if(err) return res.json({Status: false, Error: err})
            return res.json({Status: true})
        })
    })
})
//Query teacher
router.get('/employee', (req, res) => {
    const sql = "SELECT * FROM employee";
    con.query(sql, (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"})
        return res.json({Status: true, Result: result})
    })
})

router.get('/employee/:id', (req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM employee WHERE id = ?";
    con.query(sql,[id], (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"})
        return res.json({Status: true, Result: result})
    })
})

//Delete teacher
router.delete('/delete_employee/:id', (req, res) => {
    const id = req.params.id;
    const sql = "DELETE FROM employee WHERE id = ?";
    con.query(sql, [id], (err, result) => {
        if (err) {
            console.error("Error deleting employee:", err);
            return res.status(500).json({ Status: false, Error: "Failed to delete employee" });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ Status: false, Error: "Employee not found" });
        }

        return res.json({ Status: true, Message: "Employee deleted successfully" });
    });
});

//edit teacher
router.put('/edit_employee/:id', (req, res) => {
    const id = req.params.id;
    const sql = `UPDATE employee 
        set name = ?, email = ?, department = ?, address = ?,  course_id = ? 
        Where id = ?`
    const values = [
        req.body.name,
        req.body.email,
        req.body.department,
        req.body.address,
        req.body.course_id
    ]
    con.query(sql,[...values, id], (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"+err})
        return res.json({Status: true, Result: result})
    })
})



//student CRUD function
router.post('/add_student', upload.single('image'), (req, res) => {
    const sql = `INSERT INTO student 
    (name, email, password, age, address, nationality, gender, image, course) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?,?)`;
    bcrypt.hash(req.body.password, 10, (err, hash) => {
        if (err) return res.json({ Status: false, Error: "Query Error" });

        const values = [
            req.body.name,
            req.body.email,
            hash, // hashed password
            req.body.age,
            req.body.address,
            req.body.nationality,
            req.body.gender,
            req.file.filename, // req.file.filename contains the image
            req.body.course_id
        ];
        
        con.query(sql, values, (err, result) => {
            if (err) return res.json({ Status: false, Error: err });
            console.log(result);
            return res.json({ Status: true });
        });
    });
});


router.get('/student', (req, res) => {
    const sql = "SELECT * FROM student";
    con.query(sql, (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"})
        return res.json({Status: true, Result: result})
    })
})

router.delete('/delete_student/:id', (req, res) => {
    const id = req.params.id;
    const sql = "delete from student where id = ?"
    con.query(sql,[id], (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"+err})
        return res.json({Status: true, Result: result})
    })
})

router.put('/edit_student/:id', (req, res) => {
    const id = req.params.id;
    const sql = `UPDATE student 
        set name = ?, email = ?, age = ?, address = ?, course = ? 
        Where id = ?`
    const values = [
        req.body.name,
        req.body.email,
        req.body.age,
        req.body.address,
        req.body.course_id
    ]
    con.query(sql,[...values, id], (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"+err})
        return res.json({Status: true, Result: result})
    })
})
//student part ends here



//student count

router.get('/student_count', (req, res) => {
    const sql = "SELECT COUNT(id) AS total_students FROM student";
    con.query(sql, (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"+err})
        return res.json({Status: true, Result: result})
    })
});

router.get('/male_count', (req, res) => {
    const sql = "SELECT COUNT(*) AS male_count FROM student WHERE gender = 'male'";
    con.query(sql, (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"+err})
        const maleCount = result[0].male_count;
        getTotalStudentCount(res, maleCount);
    })
});

router.get('/female_count', (req, res) => {
    const sql = "SELECT COUNT(*) AS female_count FROM student WHERE gender = 'female'";
    con.query(sql, (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"+err})
        const femaleCount = result[0].female_count;
        getTotalStudentCount(res, undefined, femaleCount);
    })
});

function getTotalStudentCount(res, maleCount = 0, femaleCount = 0) {
    const sql = "SELECT COUNT(id) AS total_students FROM student";
    con.query(sql, (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"+err})
        const totalStudents = result[0].total_students;
        return res.json({Status: true, totalStudents, maleCount, femaleCount});
    });
}

//Count count admin

router.get('/admin_count', (req, res) => {
    const sql = "select count(id) as admin from admin";
    con.query(sql, (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"+err})
        return res.json({Status: true, Result: result})
    })
})


router.get('/logout', (req, res) => {
    res.clearCookie('token')
    return res.json({Status: true})
})

router.get('/detail/:id', (req, res) =>{
    const id = req.params.id;
    const sql = "SELECT * FROM employee where id = ?"
    con.query(sql, [id], (err, result) =>{
        if(err) return res.json({Status: false});
            return res.json(result)
    })
})

// Add routes for student count and records
router.get('/student_count', (req, res) => {
    const sql = "select count(id) as student from student";
    con.query(sql, (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"+err})
        return res.json({Status: true, Result: result})
    })
});

router.get('/student_records', (req, res) => {
    const sql = "SELECT * FROM student";
    con.query(sql, (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"})
        return res.json({Status: true, Result: result})
    })
});

// Get all events from calendar
router.get('/events', (req, res) => {
    const sql = "SELECT * FROM calendar";
    con.query(sql, (err, result) => {
        if (err) {
            console.error("Error fetching events:", err);
            return res.status(500).json({ status: false, error: "Failed to fetch events" });
        }
        return res.status(200).json({ status: true, events: result });
    });
});

// Add a new event to calendar
router.post('/events', (req, res) => {
    const { title, description, start_time, end_time } = req.body;
    const sql = "INSERT INTO calendar (title, description, start_time, end_time) VALUES (?, ?, ?, ?)";
    con.query(sql, [title, description, start_time, end_time], (err, result) => {
        if (err) {
            console.error("Error adding event:", err);
            return res.status(500).json({ status: false, error: "Failed to add event" });
        }
        return res.status(201).json({ status: true, message: "Event added successfully" });
    });
});

// Delete an event from calendar by ID
router.delete('/events/:id', (req, res) => {
    const eventId = req.params.id;
    const sql = "DELETE FROM calendar WHERE id = ?";
    con.query(sql, [eventId], (err, result) => {
        if (err) {
            console.error("Error deleting event:", err);
            return res.status(500).json({ status: false, error: "Failed to delete event" });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ status: false, error: "Event not found" });
        }
        return res.status(200).json({ status: true, message: "Event deleted successfully" });
    });
});

export { router as adminRouter };