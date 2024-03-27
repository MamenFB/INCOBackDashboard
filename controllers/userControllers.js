// userscontrollers.js

import express from "express";
import Jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

const router = express.Router();

// Middleware para verificar el token
const verifyUser = (req, res, next) => {
    const token = req.cookies.token; 
    if (token) {
        Jwt.verify(token, "jwt_secret_key", (err, decoded) => {
            if (err) return res.json({ Status: false, Error: "Token incorrecto" });
            req.id = decoded.email;
            req.role = decoded.role;
            next();
        });
    } else {
        return res.json({ Status: false, error: "No autenticado" });
    }
};

// Ruta para verificar el estado de autenticación
router.get('/verify', verifyUser, (req, res) => {
    return res.json({ Status: true, role: req.role, id: req.id });
});

export default router;
