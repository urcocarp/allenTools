import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3001;
const DATA_FILE = path.join(__dirname, 'data', 'registros.json');

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

function ensureDataDir() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]', 'utf8');
}

function readRegistros() {
  ensureDataDir();
  const raw = fs.readFileSync(DATA_FILE, 'utf8');
  try {
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function writeRegistros(registros) {
  ensureDataDir();
  fs.writeFileSync(DATA_FILE, JSON.stringify(registros, null, 2), 'utf8');
}

app.get('/api/registros', (req, res) => {
  try {
    const registros = readRegistros();
    res.json(registros);
  } catch (err) {
    res.status(500).json({ error: 'Error al leer registros' });
  }
});

app.post('/api/registros', (req, res) => {
  try {
    const registro = req.body;
    if (!registro || typeof registro !== 'object') {
      return res.status(400).json({ error: 'Cuerpo inválido' });
    }
    const registros = readRegistros();
    const nuevo = {
      id: registro.id || crypto.randomUUID(),
      ...registro,
      createdAt: registro.createdAt || new Date().toISOString(),
    };
    registros.push(nuevo);
    writeRegistros(registros);
    res.status(201).json(nuevo);
  } catch (err) {
    res.status(500).json({ error: 'Error al guardar registro' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor API en http://localhost:${PORT}`);
});
