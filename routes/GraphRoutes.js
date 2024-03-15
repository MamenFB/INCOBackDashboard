// Backend: Express server

import express from 'express';
import con from '../Utils/db.js';

const router = express.Router();

// Ruta existente para obtener promedios de calificaciones
router.get('/course-grades', (req, res) => {
    con.query('SELECT curso, AVG(calificacion) AS promedio FROM calificaciones GROUP BY curso', (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send('Ocurrió un error al obtener los datos del gráfico');
        } else {
            res.json(result);
        }
    });
});

// Ruta para añadir una calificación
router.post('/add-grade', (req, res) => {
    const { curso, estudianteId, calificacion } = req.body;
    const query = 'INSERT INTO calificaciones (curso, estudianteId, calificacion) VALUES (?, ?, ?)';

    con.query(query, [curso, estudianteId, calificacion], (err, result) => {
        if (err) {
            console.error('Error al añadir la calificación:', err);
            res.status(500).send('Error al añadir la calificación');
        } else {
            res.status(200).send('Calificación añadida correctamente');
        }
    });
});

export default router;
