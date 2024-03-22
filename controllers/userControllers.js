
import express from "express";
import cors from 'cors';
import {adminRouter} from "./Routes/AdminRoute.js";
import { EmployeeRouter } from "./Routes/Employee.Route.js";
import { TeacherRouter } from "./Routes/TeacherRouter.js";
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
app.use('/teacher', TeacherRouter)
app.use(express.static('Public'))

const verifyUser = (req, res, next) => {
    const token = req.cookies.token; 
    if(token) {
        Jwt.verify(token, "jwt_secret_key", (err,decoded) =>{
            if(err) return res,json({Status: false, Eroor: "wrong Token"})
            req.id = decoded.email;
            req.role = decoded.role;

        })
    }else{
        return res.json({Status: false, error: "not authenticated"})
    }

}
app.get('/verify',verifyUser, (req, res)=>{
    return res.json({Status: true, role: req.role, id: req.id})
})

app.listen(3000, () => {
    console.log("server is running")
});