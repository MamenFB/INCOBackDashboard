import express from "express";
import cors from 'cors';
import {adminRouter} from "./routes/AdminRoute.js";
import { EmployeeRouter } from "./routes/Employee.Route.js";
import  Jwt  from "jsonwebtoken";
import cookieParser from "cookie-parser";

const app = express();
app.use(cors({
    origin: ["http://localhost:5173"],
    methods: ['GET', 'POST', 'PUT','DELETE' ],
    credentials: true
}

))
app.use(express.json())
app.use(cookieParser())
app.use('/auth', adminRouter)
app.use('/employee', EmployeeRouter)
app.use(express.static('Public'))

const verifyUser = (req, res, next) => {
    const token = req.cookies.token; 
    if(token) {
        Jwt.verify(token, "jwt_secret_key", (err, decoded) =>{
            if(err) return res.json({ Status: false, Error: "wrong Token" });
            req.id = decoded.email;
            req.role = decoded.role;
            next(); // Call next() to proceed to the next middleware
        });
    } else {
        return res.json({ Status: false, error: "not authenticated" });
    }
};

app.get('/verify',verifyUser, (req, res)=>{
    return res.json({Status: true, role: req.role, id: req.id})
})

app.listen(3000, () => {
    console.log("server is running")
});