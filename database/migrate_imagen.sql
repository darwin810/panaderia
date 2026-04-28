-- Agrega columna imagen_url a la tabla productos
-- Ejecutar UNA sola vez en la base de datos
ALTER TABLE productos ADD COLUMN IF NOT EXISTS imagen_url TEXT DEFAULT NULL;
