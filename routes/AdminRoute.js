import express from "express";
import con from "../Utils/db.js";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt'
import multer from "multer";
import path from "path";

const router = express.Router();


router.post("/adminlogin", (req, res) => {
  const sql = "SELECT * from admin Where email = ? and password = ?";
  con.query(sql, [req.body.email, req.body.password], (err, result) => {
    if (err) return res.json({ loginStatus: false, Error: "Query error" });
    if (result.length > 0) {
      const email = result[0].email;
      const token = jwt.sign(
        { role: "admin", email: email, id: result[0].id },
        "jwt_secret_key",
        { expiresIn: "1d" }
      );
      res.cookie('token', token)
      return res.json({ loginStatus: true, id: result[0].id });
    } else {
        return res.json({ loginStatus: false, Error:"wrong email or password" });
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

router.post('/add_employee',upload.single('image'), (req, res) => {
    const sql = `INSERT INTO employee 
    (name,email,password, address, age,image, course_id) 
    VALUES (?)`;
    bcrypt.hash(req.body.password, 10, (err, hash) => {
        if(err) return res.json({Status: false, Error: "Query Error"})
        const values = [
            req.body.name,
            req.body.email,
            hash,
            req.body.address,
            req.body.age, 
            req.file.filename,//image
            req.body.course_id
        ]
        con.query(sql, [values], (err, result) => {
            if(err) return res.json({Status: false, Error: err})
            return res.json({Status: true})
        })
    })
})

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


router.delete('/delete_employee/:id', (req, res) => {
    const id = req.params.id;
    const sql = "delete from employee where id = ?"
    con.query(sql,[id], (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"+err})
        return res.json({Status: true, Result: result})
    })
})

router.get('/admin_count', (req, res) => {
    const sql = "select count(id) as admin from admin";
    con.query(sql, (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"+err})
        return res.json({Status: true, Result: result})
    })
})

//course CRUD
router.delete('/delete_course/:id', (req, res) => {
    const id = req.params.id;
    const sql = "delete from course where id = ?"
    con.query(sql,[id], (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"+err})
        return res.json({Status: true, Result: result})
    })
})







//Couse CRUD ends here


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


//Teacher CRUD function
router.get('/employee', (req, res) => {
    const sql = "SELECT * FROM employee";
    con.query(sql, (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"})
        return res.json({Status: true, Result: result})
    })
})


//employee count

router.get('/employee_count', (req, res) => {
    const sql = "select count(id) as employee from employee";
    con.query(sql, (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"+err})
        return res.json({Status: true, Result: result})
    })
})

router.get('/age_count', (req, res) => {
    const sql = "select sum(age) as age from employee";
    con.query(sql, (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"+err})
        return res.json({Status: true, Result: result})
    })
})

router.get('/admin_records', (req, res) => {
    const sql = "select * from admin"
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

export { router as adminRouter };