import { useState, useEffect } from 'react';
import Form from './components/Form/Form';
import IvaCalculator from './components/IvaCalculator/IvaCalculator';
import TablaRegistros from './components/TablaRegistros/TablaRegistros';
import { saveRegistro } from './api/registros';
import styles from './App.module.css';

const STORAGE_KEY = 'allentools-derivaciones';

const HERRAMIENTAS = [
  { id: 'derivacion', label: 'Formulario derivación', Component: Form },
  { id: 'tabla', label: 'Derivaciones', Component: null },
  { id: 'iva', label: 'Calculadora IVA', Component: IvaCalculator },
];

function App() {
  const [activa, setActiva] = useState('derivacion');
  const [registros, setRegistros] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        return Array.isArray(data) ? data : [];
      }
    } catch (_) {}
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(registros));
    } catch (_) {}
  }, [registros]);

  const onGuardar = (registro) => {
    setRegistros((prev) => [...prev, registro]);
    saveRegistro(registro);
  };

  const onClearRegistros = () => {
    if (registros.length && window.confirm('¿Vaciar todos los registros de la tabla?')) {
      setRegistros([]);
    }
  };

  const onDeleteRegistro = (id) => {
    setRegistros((prev) => prev.filter((r) => r.id !== id));
  };

  const herramienta = HERRAMIENTAS.find((h) => h.id === activa) ?? HERRAMIENTAS[0];
  const { Component } = herramienta;

  const renderMain = () => {
    if (activa === 'derivacion') return <Form onGuardar={onGuardar} />;
    if (activa === 'tabla') return <TablaRegistros registros={registros} onClear={onClearRegistros} onDelete={onDeleteRegistro} />;
    return Component ? <Component /> : null;
  };

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.titulo}>#AllenTools</h1>
        <nav className={styles.nav}>
          {HERRAMIENTAS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              className={activa === id ? styles.navBtnActivo : styles.navBtn}
              onClick={() => setActiva(id)}
            >
              {label}
            </button>
          ))}
        </nav>
      </header>
      <main className={styles.main}>
        {renderMain()}
      </main>
    </div>
  );
}

export default App;
