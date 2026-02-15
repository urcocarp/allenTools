import { useState } from 'react';
import Form from './components/Form/Form';
import IvaCalculator from './components/IvaCalculator/IvaCalculator';
import styles from './App.module.css';

const HERRAMIENTAS = [
  { id: 'derivacion', label: 'Formulario derivación', Component: Form },
  { id: 'iva', label: 'Calculadora IVA', Component: IvaCalculator },
];

function App() {
  const [activa, setActiva] = useState('derivacion');
  const { Component } = HERRAMIENTAS.find((h) => h.id === activa) ?? HERRAMIENTAS[0];

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.titulo}>AllenTools</h1>
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
        <Component />
      </main>
    </div>
  );
}

export default App;
