import { useState, useEffect } from 'react';
import Form from './components/Form/Form';
import IvaCalculator from './components/IvaCalculator/IvaCalculator';
import TablaRegistros from './components/TablaRegistros/TablaRegistros';
import { saveRegistro, loadRegistros } from './api/registros';
import styles from './App.module.css';
import logo from './assets/allende.jpg';

const STORAGE_KEY = 'allentools-derivaciones';
const STORAGE_RECHAZADAS_KEY = 'allentools-derivaciones-rechazadas';

const HERRAMIENTAS = [
  { id: 'derivacion', label: 'Formulario derivación', Component: Form },
  { id: 'tabla', label: 'Derivaciones', Component: null },
  { id: 'iva', label: 'Calculadora IVA', Component: IvaCalculator },
];

function App() {
  const [activa, setActiva] = useState('derivacion');
  const [registroParaImprimir, setRegistroParaImprimir] = useState(null);
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
  const [rechazadas, setRechazadas] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_RECHAZADAS_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        return Array.isArray(data) ? data : [];
      }
    } catch (_) {}
    return [];
  });

  const navigate = (id) => {
    setActiva(id);
    window.location.hash = `#${id}`;
  };

  // Navegación por hash (#derivacion, #tabla, #iva)
  useEffect(() => {
    const syncFromHash = () => {
      const hash = window.location.hash.replace('#', '');
      const existe = HERRAMIENTAS.some((h) => h.id === hash);
      if (existe) setActiva(hash);
    };

    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, []);

  // Si hay backend configurado, sincronizar registros desde la API al cargar
  useEffect(() => {
    let cancelado = false;
    const sync = async () => {
      const desdeApi = await loadRegistros();
      if (!cancelado && Array.isArray(desdeApi) && desdeApi.length > 0) {
        setRegistros(desdeApi);
      }
    };
    sync();
    return () => {
      cancelado = true;
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(registros));
    } catch (_) {}
  }, [registros]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_RECHAZADAS_KEY, JSON.stringify(rechazadas));
    } catch (_) {}
  }, [rechazadas]);

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
    setRegistros((prev) => {
      const registro = prev.find((r) => r.id === id);
      if (registro) {
        setRechazadas((prevRech) => [
          ...prevRech,
          { ...registro, rechazadoAt: new Date().toISOString() },
        ]);
      }
      return prev.filter((r) => r.id !== id);
    });
  };

  const herramienta = HERRAMIENTAS.find((h) => h.id === activa) ?? HERRAMIENTAS[0];
  const { Component } = herramienta;

  const handlePrintDesdeTabla = (registro) => {
    setRegistroParaImprimir(registro);
    navigate('derivacion');
  };

  const renderMain = () => {
    if (activa === 'derivacion') {
      return (
        <Form
          onGuardar={onGuardar}
          registroParaImprimir={registroParaImprimir}
          modoReimpresion={Boolean(registroParaImprimir)}
          onImpresionCompleta={() => {
            setRegistroParaImprimir(null);
            navigate('tabla');
          }}
        />
      );
    }
    if (activa === 'tabla') {
      return (
        <TablaRegistros
          registros={registros}
          rechazadas={rechazadas}
          onClear={onClearRegistros}
          onDelete={onDeleteRegistro}
          onPrint={handlePrintDesdeTabla}
        />
      );
    }
    return Component ? <Component /> : null;
  };

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <img src={logo} alt="Sanatorio Allende" className={styles.brandLogo} />
          <h1 className={styles.titulo}>#AllenTools</h1>
        </div>
        <nav className={styles.nav}>
          {HERRAMIENTAS.map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              className={activa === id ? styles.navBtnActivo : styles.navBtn}
              onClick={(e) => {
                e.preventDefault();
                navigate(id);
              }}
            >
              {label}
            </a>
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
