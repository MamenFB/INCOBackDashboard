CREATE TABLE estudiantes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50),
    apellidos VARCHAR(100),
    curso VARCHAR(50),
    nacionalidad VARCHAR(50),
    edad INT,
    genero CHAR(1),
    telefono VARCHAR(20),
    correo VARCHAR(100)
);
INSERT INTO estudiantes (nombre, apellidos, curso, nacionalidad, edad, genero, telefono, correo) 
VALUES ('Juan', 'Perez','Ingenieria en Sistemas', 'Mexicana',  20, 'M', '5555555555', '<EMAIL>');   