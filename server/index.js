import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3001;
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'registros.db');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Inicializar conexión SQLite
sqlite3.verbose();
const db = new sqlite3.Database(DB_FILE);

db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS registros (
      id TEXT PRIMARY KEY,
      apellidoNombres TEXT,
      documento TEXT,
      lugar TEXT,
      edad TEXT,
      telefono TEXT,
      obraSocial TEXT,
      plan TEXT,
      diagnostico TEXT,
      politraumatismo TEXT,
      profesionalRecibe TEXT,
      cedeRecibe TEXT,
      observaciones TEXT,
      fc TEXT,
      fr TEXT,
      glasgow TEXT,
      sat TEXT,
      ta TEXT,
      temperatura TEXT,
      tuboOxigeno TEXT,
      trasladoMedico TEXT,
      createdAt TEXT
    )`,
  );

  // Migración simple: si la tabla ya existía sin estas columnas, las agregamos.
  const columnasNecesarias = ['profesionalRecibe', 'cedeRecibe'];
  db.all('PRAGMA table_info(registros)', (err, rows) => {
    if (err) return;
    const existentes = new Set(rows.map((r) => r.name));
    columnasNecesarias.forEach((col) => {
      if (!existentes.has(col)) {
        db.run(`ALTER TABLE registros ADD COLUMN ${col} TEXT`);
      }
    });
  });
});

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/api/registros', (req, res) => {
  db.all('SELECT * FROM registros ORDER BY datetime(createdAt) DESC', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Error al leer registros' });
    }
    return res.json(rows);
  });
});

app.post('/api/registros', (req, res) => {
  const registro = req.body;
  if (!registro || typeof registro !== 'object') {
    return res.status(400).json({ error: 'Cuerpo inválido' });
  }

  const id = registro.id || crypto.randomUUID();
  const createdAt = registro.createdAt || new Date().toISOString();

  const fields = [
    'id',
    'apellidoNombres',
    'documento',
    'lugar',
    'edad',
    'telefono',
    'obraSocial',
    'plan',
    'diagnostico',
    'politraumatismo',
    'profesionalRecibe',
    'cedeRecibe',
    'observaciones',
    'fc',
    'fr',
    'glasgow',
    'sat',
    'ta',
    'temperatura',
    'tuboOxigeno',
    'trasladoMedico',
    'createdAt',
  ];

  const values = [
    id,
    registro.apellidoNombres ?? null,
    registro.documento ?? null,
    registro.lugar ?? null,
    registro.edad ?? null,
    registro.telefono ?? null,
    registro.obraSocial ?? null,
    registro.plan ?? null,
    registro.diagnostico ?? null,
    registro.politraumatismo ?? null,
    registro.profesionalRecibe ?? null,
    registro.cedeRecibe ?? null,
    registro.observaciones ?? null,
    registro.fc ?? null,
    registro.fr ?? null,
    registro.glasgow ?? null,
    registro.sat ?? null,
    registro.ta ?? null,
    registro.temperatura ?? null,
    registro.tuboOxigeno ?? null,
    registro.trasladoMedico ?? null,
    createdAt,
  ];

  const placeholders = fields.map(() => '?').join(',');
  const sql = `INSERT INTO registros (${fields.join(',')}) VALUES (${placeholders})`;

  db.run(sql, values, (err) => {
    if (err) {
      return res.status(500).json({ error: 'Error al guardar registro' });
    }
    return res.status(201).json({ ...registro, id, createdAt });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor API (SQLite) en http://localhost:${PORT}`);
});
