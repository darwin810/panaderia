-- SCHEMA: Sistema de Ventas Panadería

CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  usuario VARCHAR(50) UNIQUE NOT NULL,
  contrasena_hash VARCHAR(255) NOT NULL,
  puesto VARCHAR(100) NOT NULL,
  rol VARCHAR(20) NOT NULL DEFAULT 'trabajador' CHECK (rol IN ('admin', 'trabajador')),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS productos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  precio DECIMAL(10,2) NOT NULL,
  categoria VARCHAR(100) NOT NULL,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ventas (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
  puesto VARCHAR(100) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  metodo_pago VARCHAR(50) DEFAULT 'efectivo',
  boleta_impresa BOOLEAN DEFAULT false,
  fecha_hora TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS venta_items (
  id SERIAL PRIMARY KEY,
  venta_id INTEGER NOT NULL REFERENCES ventas(id) ON DELETE CASCADE,
  producto_id INTEGER REFERENCES productos(id),
  nombre_producto VARCHAR(150) NOT NULL,
  cantidad INTEGER NOT NULL,
  precio_unitario DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS cierre_caja (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
  puesto VARCHAR(100) NOT NULL,
  fecha DATE NOT NULL,
  total_sistema DECIMAL(10,2) NOT NULL,
  efectivo_real DECIMAL(10,2) NOT NULL,
  diferencia DECIMAL(10,2) NOT NULL,
  estado VARCHAR(20) NOT NULL CHECK (estado IN ('correcto', 'sobrante', 'faltante')),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ventas_fecha ON ventas(DATE(fecha_hora));
CREATE INDEX IF NOT EXISTS idx_ventas_usuario ON ventas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_ventas_puesto ON ventas(puesto);