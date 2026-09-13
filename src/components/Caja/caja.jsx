import { useState, useMemo, useRef, useEffect } from 'react';
import styles from './Caja.module.css';
import logo from '../../assets/allende.jpg';

const TURNOS = ['Mañana', 'Tarde', 'Noche'];

const FILA_GUARDIA = { nombreApellido: '', numTicket: '', importe: '' };
const FILA_EFECTIVO_DEPOSITO = { numTicket: '', importe: '' };
const FILA_INTERNACIONES = {
  paciente: '',
  numeroInternado: '',
  concepto: '',
  recibo: '',
  importe: '',
};
const FILA_RENDICION = {
  paciente: '',
  concepto: '',
  recibo: '',
  factura: '',
  importe: '',
};
const FILA_CHEQUES = { banco: '', nroCheque: '', fechaCobro: '', importe: '' };
const DOLARES_VACIO = {
  nombreApellido: '',
  numRecibo: '',
  nroInternado: '',
  cambioDelDia: '',
  concepto: '',
  importeUSD: '',
};

const hoyISO = () => new Date().toISOString().slice(0, 10);

const parseMonto = (str) => {
  const s = String(str).trim().replace(/\s/g, '');
  if (!s) return null;
  const normalized = s.replace(/\./g, '').replace(',', '.');
  const n = parseFloat(normalized);
  return Number.isFinite(n) && n >= 0 ? n : null;
};

const formatPesos = (n) => {
  if (n == null || Number.isNaN(n)) return '$ 0,00';
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
};

const formatUSD = (n) => {
  if (n == null || Number.isNaN(n)) return 'USD 0,00';
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
};

const formatDiferencia = (n) => {
  if (n == null || Number.isNaN(n) || n === 0) return '$ 0,00';
  const monto = n < 0 ? -n : n;
  const pesos = formatPesos(monto);
  return n > 0 ? `+${pesos}` : `-${pesos}`;
};

const formatDiferenciaUSD = (n) => {
  if (n == null || Number.isNaN(n) || n === 0) return 'USD 0,00';
  const monto = n < 0 ? -n : n;
  const usd = formatUSD(monto);
  return n > 0 ? `+${usd}` : `-${usd}`;
};

const formatFecha = (iso) => {
  if (!iso) return '–';
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
};

const sumarImportes = (filas, campo = 'importe') =>
  filas.reduce((acc, fila) => {
    const valor = parseMonto(fila[campo]);
    return valor != null ? acc + valor : acc;
  }, 0);

const filasConDatos = (filas, campos) =>
  filas.filter((f) => campos.some((c) => String(f[c] ?? '').trim()) || parseMonto(f.importe) != null);

const Caja = () => {
  const printTimestampRef = useRef(null);

  const [nombreApellido, setNombreApellido] = useState('');
  const [fechaTurno, setFechaTurno] = useState(hoyISO);
  const [numeroPrecinto, setNumeroPrecinto] = useState('');
  const [turno, setTurno] = useState('');
  const [totalGuardiaSuperior, setTotalGuardiaSuperior] = useState('');
  const [totalDolaresSuperior, setTotalDolaresSuperior] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [seccionesAbiertas, setSeccionesAbiertas] = useState({
    guardia: true,
    internaciones: false,
    rendicion: false,
    dolares: false,
    cheques: false,
    observaciones: false,
  });

  const [filaEfectivoDeposito, setFilaEfectivoDeposito] = useState({
    ...FILA_EFECTIVO_DEPOSITO,
  });
  const [filasGuardia, setFilasGuardia] = useState([{ ...FILA_GUARDIA }]);
  const [filasInternaciones, setFilasInternaciones] = useState([{ ...FILA_INTERNACIONES }]);
  const [filasRendicion, setFilasRendicion] = useState([{ ...FILA_RENDICION }]);
  const [filasCheques, setFilasCheques] = useState([{ ...FILA_CHEQUES }]);
  const [dolares, setDolares] = useState({ ...DOLARES_VACIO });

  const totalGuardiaSuperiorNum = useMemo(
    () => parseMonto(totalGuardiaSuperior) ?? 0,
    [totalGuardiaSuperior],
  );

  const totalDolaresSuperiorNum = useMemo(
    () => parseMonto(totalDolaresSuperior) ?? 0,
    [totalDolaresSuperior],
  );

  const totalGuardiaAcordeon = useMemo(
    () =>
      (parseMonto(filaEfectivoDeposito.importe) ?? 0) + sumarImportes(filasGuardia),
    [filaEfectivoDeposito, filasGuardia],
  );

  const totalInternaciones = useMemo(
    () => sumarImportes(filasInternaciones),
    [filasInternaciones],
  );

  const totalRendicion = useMemo(
    () => sumarImportes(filasRendicion),
    [filasRendicion],
  );

  const totalCheques = useMemo(
    () => sumarImportes(filasCheques),
    [filasCheques],
  );

  const totalDolaresUSD = useMemo(
    () => parseMonto(dolares.importeUSD) ?? 0,
    [dolares.importeUSD],
  );

  const totalDolaresARS = useMemo(() => {
    const usd = parseMonto(dolares.importeUSD);
    const cambio = parseMonto(dolares.cambioDelDia);
    if (usd == null || cambio == null) return 0;
    return usd * cambio;
  }, [dolares.importeUSD, dolares.cambioDelDia]);

  const imputadoSobreEfectivo = useMemo(
    () => totalInternaciones + totalRendicion,
    [totalInternaciones, totalRendicion],
  );

  const detalleTicketNeto = useMemo(
    () => totalGuardiaAcordeon - imputadoSobreEfectivo,
    [totalGuardiaAcordeon, imputadoSobreEfectivo],
  );

  const totalARendir = useMemo(
    () =>
      detalleTicketNeto +
      totalInternaciones +
      totalRendicion +
      totalCheques,
    [
      detalleTicketNeto,
      totalInternaciones,
      totalRendicion,
      totalCheques,
    ],
  );

  // Pesos solamente: los dólares no entran acá. Se cruzan USD arriba vs acordeón.
  const totalDepositado = useMemo(
    () => totalGuardiaAcordeon + totalCheques,
    [totalGuardiaAcordeon, totalCheques],
  );

  // Internación no entra en el total de guardia del sistema: si se cobró
  // con un ticket, hay que sumarla al esperado para que se cancele.
  // Rendición varios sí forma parte de esos tickets / de la guardia: no
  // se vuelve a pedir en la diferencia.
  const totalEsperadoARS = useMemo(
    () => totalGuardiaSuperiorNum + totalInternaciones,
    [totalGuardiaSuperiorNum, totalInternaciones],
  );

  const diferencia = useMemo(
    () => totalDepositado - totalEsperadoARS,
    [totalDepositado, totalEsperadoARS],
  );

  const diferenciaDolares = useMemo(
    () => totalDolaresUSD - totalDolaresSuperiorNum,
    [totalDolaresUSD, totalDolaresSuperiorNum],
  );

  const toggleSeccion = (id) => {
    setSeccionesAbiertas((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const updateFila = (setter, index, field, value) => {
    setter((prev) =>
      prev.map((fila, i) => (i === index ? { ...fila, [field]: value } : fila)),
    );
  };

  const addFila = (setter, vacio, seccionId) => {
    setter((prev) => [...prev, { ...vacio }]);
    setSeccionesAbiertas((prev) => ({ ...prev, [seccionId]: true }));
  };

  const focusNuevaFilaRef = useRef(null);

  const filaEstaVacia = (fila, camposTexto) =>
    camposTexto.every((c) => !String(fila[c] ?? '').trim()) &&
    parseMonto(fila.importe) == null;

  const agregarFilaEnter = (setter, vacio, seccionId, camposTexto, focusAttr) => {
    setter((prev) => {
      const ultima = prev[prev.length - 1];
      if (ultima && filaEstaVacia(ultima, camposTexto)) return prev;
      return [...prev, { ...vacio }];
    });
    setSeccionesAbiertas((prev) => ({ ...prev, [seccionId]: true }));
    focusNuevaFilaRef.current = focusAttr;
  };

  useEffect(() => {
    const attr = focusNuevaFilaRef.current;
    if (!attr) return;
    focusNuevaFilaRef.current = null;
    const inputs = document.querySelectorAll(`[${attr}]`);
    inputs[inputs.length - 1]?.focus();
  }, [filasGuardia, filasInternaciones, filasRendicion]);

  const onEnterImporteTicket = (e) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    agregarFilaEnter(
      setFilasGuardia,
      FILA_GUARDIA,
      'guardia',
      ['nombreApellido', 'numTicket'],
      'data-fila-ticket-nombre',
    );
  };

  const onEnterImporteInternacion = (e) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    agregarFilaEnter(
      setFilasInternaciones,
      FILA_INTERNACIONES,
      'internaciones',
      ['paciente', 'numeroInternado', 'concepto', 'recibo'],
      'data-fila-internacion-paciente',
    );
  };

  const onEnterImporteRendicion = (e) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    agregarFilaEnter(
      setFilasRendicion,
      FILA_RENDICION,
      'rendicion',
      ['paciente', 'concepto', 'recibo', 'factura'],
      'data-fila-rendicion-paciente',
    );
  };

  const removeFila = (setter, vacio, index) => {
    setter((prev) =>
      prev.length <= 1 ? [{ ...vacio }] : prev.filter((_, i) => i !== index),
    );
  };

  const limpiar = () => {
    setNombreApellido('');
    setFechaTurno(hoyISO());
    setNumeroPrecinto('');
    setTurno('');
    setTotalGuardiaSuperior('');
    setTotalDolaresSuperior('');
    setObservaciones('');
    setFilaEfectivoDeposito({ ...FILA_EFECTIVO_DEPOSITO });
    setFilasGuardia([{ ...FILA_GUARDIA }]);
    setFilasInternaciones([{ ...FILA_INTERNACIONES }]);
    setFilasRendicion([{ ...FILA_RENDICION }]);
    setFilasCheques([{ ...FILA_CHEQUES }]);
    setDolares({ ...DOLARES_VACIO });
    setSeccionesAbiertas({
      guardia: true,
      internaciones: false,
      rendicion: false,
      dolares: false,
      cheques: false,
      observaciones: false,
    });
  };

  const handlePrint = () => {
    const now = new Date().toLocaleString('es-AR', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
    if (printTimestampRef.current) {
      printTimestampRef.current.textContent = `Impreso: ${now}`;
    }
    window.print();
  };

  const renderBtnRemove = (onClick, label) => (
    <button
      type="button"
      className={`${styles.btnRemove} ${styles.noPrint}`}
      onClick={onClick}
      aria-label={label}
      title="Quitar"
    >
      <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
        <path
          fill="currentColor"
          d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
        />
      </svg>
    </button>
  );

  return (
    <section className={styles.wrapper}>
      <div className={styles.printHeader}>
        <img src={logo} alt="Sanatorio Allende" className={styles.printLogo} />
        <div>
          <h2 className={styles.titulo}>Cierre de Caja</h2>
          <p className={styles.printTimestamp} ref={printTimestampRef} />
        </div>
      </div>

      <div className={`${styles.topBar} ${styles.noPrint}`}>
        <div className={styles.topBarLeft}>
          <h2 className={styles.tituloPantalla}>Cierre de Caja</h2>
          <span className={styles.badgeActivo}>Turno Activo</span>
        </div>
        <div className={styles.topBarRight}>
          <label className={styles.fechaPicker}>
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              <path
                fill="currentColor"
                d="M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 16H5V9h14v11z"
              />
            </svg>
            <input
              type="date"
              value={fechaTurno}
              onChange={(e) => setFechaTurno(e.target.value)}
              aria-label="Fecha del turno"
            />
          </label>
          <button type="button" className={styles.btnLimpiar} onClick={limpiar}>
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              <path
                fill="currentColor"
                d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
              />
            </svg>
            Limpiar
          </button>
          <button type="button" className={styles.btnPrint} onClick={handlePrint}>
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              <path
                fill="currentColor"
                d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"
              />
            </svg>
            Imprimir cierre
          </button>
        </div>
      </div>

      <div className={`${styles.datosCard} ${styles.noPrint}`}>
        <div className={styles.introGrid}>
          <div className={styles.inputGroup}>
            <label htmlFor="nombre-apellido">
              <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                />
              </svg>
              Nombre y apellido
            </label>
            <input
              id="nombre-apellido"
              type="text"
              placeholder="Ej: García, Juan"
              value={nombreApellido}
              onChange={(e) => setNombreApellido(e.target.value)}
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="fecha-turno-card">Fecha del turno</label>
            <input
              id="fecha-turno-card"
              type="date"
              value={fechaTurno}
              onChange={(e) => setFechaTurno(e.target.value)}
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="numero-precinto">
              <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M17.63 5.84C17.27 5.33 16.67 5 16 5L5 5.01C3.9 5.01 3 5.9 3 7v10c0 1.1.9 1.99 2 1.99L16 19c.67 0 1.27-.33 1.63-.84L22 12l-4.37-6.16z"
                />
              </svg>
              Nº de precinto
            </label>
            <input
              id="numero-precinto"
              type="text"
              inputMode="numeric"
              placeholder="Ej: 12345"
              value={numeroPrecinto}
              onChange={(e) => setNumeroPrecinto(e.target.value)}
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="turno">Turno</label>
            <select
              id="turno"
              value={turno}
              onChange={(e) => setTurno(e.target.value)}
            >
              <option value="">Seleccionar…</option>
              {TURNOS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.totalesSuperioresRow}>
          <div className={styles.totalGuardiaSuperiorRow}>
            <label htmlFor="total-guardia-superior">Total de guardia</label>
            <input
              id="total-guardia-superior"
              type="text"
              inputMode="decimal"
              placeholder="$ 0,00"
              value={totalGuardiaSuperior}
              onChange={(e) => setTotalGuardiaSuperior(e.target.value)}
            />
          </div>
          <div className={`${styles.totalGuardiaSuperiorRow} ${styles.totalDolaresSuperiorRow}`}>
            <label htmlFor="total-dolares-superior">Total de dólares</label>
            <input
              id="total-dolares-superior"
              type="text"
              inputMode="decimal"
              placeholder="USD 0,00"
              value={totalDolaresSuperior}
              onChange={(e) => setTotalDolaresSuperior(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className={`${styles.acordeones} ${styles.noPrint}`}>
        {/* GUARDIA */}
        <div className={`${styles.acordeon} ${styles.acordeonBlue}`}>
          <button
            type="button"
            className={`${styles.acordeonHeader} ${styles.noPrint}`}
            onClick={() => toggleSeccion('guardia')}
            aria-expanded={seccionesAbiertas.guardia}
          >
            <span className={`${styles.acordeonIcono} ${styles.iconBlue}`}>
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"
                />
              </svg>
            </span>
            <span className={styles.acordeonTitulos}>
              <strong>Detalle Ticket</strong>
              <small>Tickets de cobro de guardia</small>
            </span>
            <span className={styles.acordeonTotal}>{formatPesos(totalGuardiaAcordeon)}</span>
            <span className={styles.acordeonChevron}>
              {seccionesAbiertas.guardia ? '▾' : '▸'}
            </span>
          </button>
          <div
            className={`${styles.acordeonBody} ${seccionesAbiertas.guardia ? styles.acordeonBodyAbierto : ''} ${styles.noPrint}`}
          >
            <div className={`${styles.tablaHeader} ${styles.tablaHeaderBlue}`}>
              <span>Nombre y apellido</span>
              <span>Nº ticket</span>
              <span>Importe</span>
              <span className={styles.colAccion} />
            </div>
            <ul className={styles.filasList}>
              <li className={`${styles.filaRow} ${styles.filaRowGuardia}`}>
                <span className={styles.nombreFijo}>EFECTIVO/DEPOSITO</span>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Ticket"
                  aria-label="Nº ticket efectivo/depósito"
                  value={filaEfectivoDeposito.numTicket}
                  onChange={(e) =>
                    setFilaEfectivoDeposito((prev) => ({
                      ...prev,
                      numTicket: e.target.value,
                    }))
                  }
                />
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="0,00"
                  aria-label="Importe efectivo/depósito"
                  value={filaEfectivoDeposito.importe}
                  onChange={(e) =>
                    setFilaEfectivoDeposito((prev) => ({
                      ...prev,
                      importe: e.target.value,
                    }))
                  }
                  className={styles.inputImporte}
                  onKeyDown={onEnterImporteTicket}
                />
                <span className={styles.colAccion} />
              </li>
              {filasGuardia.map((fila, index) => (
                <li key={index} className={`${styles.filaRow} ${styles.filaRowGuardia}`}>
                  <input
                    type="text"
                    placeholder="Nombre"
                    data-fila-ticket-nombre=""
                    value={fila.nombreApellido}
                    onChange={(e) =>
                      updateFila(setFilasGuardia, index, 'nombreApellido', e.target.value)
                    }
                  />
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Ticket"
                    value={fila.numTicket}
                    onChange={(e) =>
                      updateFila(setFilasGuardia, index, 'numTicket', e.target.value)
                    }
                  />
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="0,00"
                    value={fila.importe}
                    onChange={(e) =>
                      updateFila(setFilasGuardia, index, 'importe', e.target.value)
                    }
                    className={styles.inputImporte}
                    onKeyDown={onEnterImporteTicket}
                  />
                  {renderBtnRemove(
                    () => removeFila(setFilasGuardia, FILA_GUARDIA, index),
                    `Quitar fila ${index + 1} detalle ticket`,
                  )}
                </li>
              ))}
            </ul>
            <div className={styles.acordeonFooter}>
              <button
                type="button"
                className={styles.btnAdd}
                onClick={() => addFila(setFilasGuardia, FILA_GUARDIA, 'guardia')}
              >
                + Agregar fila
              </button>
              <div className={styles.totalesTicketBox}>
                <div className={`${styles.totalSeccion} ${styles.totalSeccionBlue}`}>
                  <span>Total Detalle Ticket</span>
                  <strong>{formatPesos(totalGuardiaAcordeon)}</strong>
                </div>
                {imputadoSobreEfectivo > 0 && (
                  <>
                    <div className={`${styles.totalSeccion} ${styles.totalSeccionImputa}`}>
                      <span>Menos internaciones y rendiciones</span>
                      <strong>-{formatPesos(imputadoSobreEfectivo)}</strong>
                    </div>
                    <div className={`${styles.totalSeccion} ${styles.totalSeccionBlue}`}>
                      <span>Neto efectivo / tickets</span>
                      <strong>{formatPesos(detalleTicketNeto)}</strong>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* INTERNACIONES */}
        <div className={`${styles.acordeon} ${styles.acordeonGreen}`}>
          <button
            type="button"
            className={`${styles.acordeonHeader} ${styles.noPrint}`}
            onClick={() => toggleSeccion('internaciones')}
            aria-expanded={seccionesAbiertas.internaciones}
          >
            <span className={`${styles.acordeonIcono} ${styles.iconGreen}`}>
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h5V6h4v4h5v4z"
                />
              </svg>
            </span>
            <span className={styles.acordeonTitulos}>
              <strong>Internaciones</strong>
              <small>Cobros por internación</small>
            </span>
            <span className={styles.acordeonTotal}>{formatPesos(totalInternaciones)}</span>
            <span className={styles.acordeonChevron}>
              {seccionesAbiertas.internaciones ? '▾' : '▸'}
            </span>
          </button>
          <div
            className={`${styles.acordeonBody} ${seccionesAbiertas.internaciones ? styles.acordeonBodyAbierto : ''} ${styles.noPrint}`}
          >
            <div className={`${styles.tablaHeader} ${styles.tablaHeaderGreen}`}>
              <span>Paciente</span>
              <span>Número internado</span>
              <span>Concepto</span>
              <span>Recibo</span>
              <span>Importe</span>
              <span className={styles.colAccion} />
            </div>
            <ul className={styles.filasList}>
              {filasInternaciones.map((fila, index) => (
                <li key={index} className={`${styles.filaRow} ${styles.filaRowInternaciones}`}>
                  <input
                    type="text"
                    value={fila.paciente}
                    data-fila-internacion-paciente=""
                    onChange={(e) =>
                      updateFila(setFilasInternaciones, index, 'paciente', e.target.value)
                    }
                  />
                  <input
                    type="text"
                    value={fila.numeroInternado}
                    onChange={(e) =>
                      updateFila(setFilasInternaciones, index, 'numeroInternado', e.target.value)
                    }
                  />
                  <input
                    type="text"
                    value={fila.concepto}
                    onChange={(e) =>
                      updateFila(setFilasInternaciones, index, 'concepto', e.target.value)
                    }
                  />
                  <input
                    type="text"
                    value={fila.recibo}
                    onChange={(e) =>
                      updateFila(setFilasInternaciones, index, 'recibo', e.target.value)
                    }
                  />
                  <input
                    type="text"
                    inputMode="decimal"
                    value={fila.importe}
                    onChange={(e) =>
                      updateFila(setFilasInternaciones, index, 'importe', e.target.value)
                    }
                    className={styles.inputImporte}
                    onKeyDown={onEnterImporteInternacion}
                  />
                  {renderBtnRemove(
                    () => removeFila(setFilasInternaciones, FILA_INTERNACIONES, index),
                    `Quitar fila ${index + 1} internaciones`,
                  )}
                </li>
              ))}
            </ul>
            <div className={styles.acordeonFooter}>
              <button
                type="button"
                className={styles.btnAdd}
                onClick={() =>
                  addFila(setFilasInternaciones, FILA_INTERNACIONES, 'internaciones')
                }
              >
                + Agregar fila
              </button>
              <div className={`${styles.totalSeccion} ${styles.totalSeccionGreen}`}>
                <span>Total Internaciones</span>
                <strong>{formatPesos(totalInternaciones)}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* RENDICIÓN VARIOS */}
        <div className={`${styles.acordeon} ${styles.acordeonOrange}`}>
          <button
            type="button"
            className={`${styles.acordeonHeader} ${styles.noPrint}`}
            onClick={() => toggleSeccion('rendicion')}
            aria-expanded={seccionesAbiertas.rendicion}
          >
            <span className={`${styles.acordeonIcono} ${styles.iconOrange}`}>
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"
                />
              </svg>
            </span>
            <span className={styles.acordeonTitulos}>
              <strong>Rendición Varios</strong>
              <small>Cobros varios / misceláneos</small>
            </span>
            <span className={styles.acordeonTotal}>{formatPesos(totalRendicion)}</span>
            <span className={styles.acordeonChevron}>
              {seccionesAbiertas.rendicion ? '▾' : '▸'}
            </span>
          </button>
          <div
            className={`${styles.acordeonBody} ${seccionesAbiertas.rendicion ? styles.acordeonBodyAbierto : ''} ${styles.noPrint}`}
          >
            <div className={`${styles.tablaHeader} ${styles.tablaHeaderOrange}`}>
              <span>Paciente</span>
              <span>Concepto</span>
              <span>Recibo</span>
              <span>Factura</span>
              <span>Importe</span>
              <span className={styles.colAccion} />
            </div>
            <ul className={styles.filasList}>
              {filasRendicion.map((fila, index) => (
                <li key={index} className={`${styles.filaRow} ${styles.filaRowRendicion}`}>
                  <input
                    type="text"
                    value={fila.paciente}
                    data-fila-rendicion-paciente=""
                    onChange={(e) =>
                      updateFila(setFilasRendicion, index, 'paciente', e.target.value)
                    }
                  />
                  <input
                    type="text"
                    value={fila.concepto}
                    onChange={(e) =>
                      updateFila(setFilasRendicion, index, 'concepto', e.target.value)
                    }
                  />
                  <input
                    type="text"
                    value={fila.recibo}
                    onChange={(e) =>
                      updateFila(setFilasRendicion, index, 'recibo', e.target.value)
                    }
                  />
                  <input
                    type="text"
                    value={fila.factura}
                    onChange={(e) =>
                      updateFila(setFilasRendicion, index, 'factura', e.target.value)
                    }
                  />
                  <input
                    type="text"
                    inputMode="decimal"
                    value={fila.importe}
                    onChange={(e) =>
                      updateFila(setFilasRendicion, index, 'importe', e.target.value)
                    }
                    className={styles.inputImporte}
                    onKeyDown={onEnterImporteRendicion}
                  />
                  {renderBtnRemove(
                    () => removeFila(setFilasRendicion, FILA_RENDICION, index),
                    `Quitar fila ${index + 1} rendición`,
                  )}
                </li>
              ))}
            </ul>
            <div className={styles.acordeonFooter}>
              <button
                type="button"
                className={styles.btnAdd}
                onClick={() => addFila(setFilasRendicion, FILA_RENDICION, 'rendicion')}
              >
                + Agregar fila
              </button>
              <div className={`${styles.totalSeccion} ${styles.totalSeccionOrange}`}>
                <span>Total Varios</span>
                <strong>{formatPesos(totalRendicion)}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* DÓLARES EN CAUCIÓN */}
        <div className={`${styles.acordeon} ${styles.acordeonYellow}`}>
          <button
            type="button"
            className={`${styles.acordeonHeader} ${styles.noPrint}`}
            onClick={() => toggleSeccion('dolares')}
            aria-expanded={seccionesAbiertas.dolares}
          >
            <span className={`${styles.acordeonIcono} ${styles.iconYellow}`}>
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"
                />
              </svg>
            </span>
            <span className={styles.acordeonTitulos}>
              <strong>Dólares en Caución</strong>
              <small>Depósitos en dólares</small>
            </span>
            <span className={styles.acordeonTotal}>{formatUSD(totalDolaresUSD)}</span>
            <span className={styles.acordeonChevron}>
              {seccionesAbiertas.dolares ? '▾' : '▸'}
            </span>
          </button>
          <div
            className={`${styles.acordeonBody} ${seccionesAbiertas.dolares ? styles.acordeonBodyAbierto : ''} ${styles.noPrint}`}
          >
            <div className={styles.dolaresGrid}>
              <div className={styles.inputGroup}>
                <label htmlFor="dol-nombre">Nombre y apellido</label>
                <input
                  id="dol-nombre"
                  type="text"
                  value={dolares.nombreApellido}
                  onChange={(e) =>
                    setDolares((prev) => ({ ...prev, nombreApellido: e.target.value }))
                  }
                />
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor="dol-recibo">Nº de recibo</label>
                <input
                  id="dol-recibo"
                  type="text"
                  value={dolares.numRecibo}
                  onChange={(e) =>
                    setDolares((prev) => ({ ...prev, numRecibo: e.target.value }))
                  }
                />
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor="dol-internado">Nro de internado</label>
                <input
                  id="dol-internado"
                  type="text"
                  value={dolares.nroInternado}
                  onChange={(e) =>
                    setDolares((prev) => ({ ...prev, nroInternado: e.target.value }))
                  }
                />
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor="dol-cambio">Cambio del día</label>
                <input
                  id="dol-cambio"
                  type="text"
                  inputMode="decimal"
                  value={dolares.cambioDelDia}
                  onChange={(e) =>
                    setDolares((prev) => ({ ...prev, cambioDelDia: e.target.value }))
                  }
                />
              </div>
              <div className={`${styles.inputGroup} ${styles.dolaresConcepto}`}>
                <label htmlFor="dol-concepto">Concepto</label>
                <input
                  id="dol-concepto"
                  type="text"
                  value={dolares.concepto}
                  onChange={(e) =>
                    setDolares((prev) => ({ ...prev, concepto: e.target.value }))
                  }
                />
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor="dol-importe">Importe (USD)</label>
                <input
                  id="dol-importe"
                  type="text"
                  inputMode="decimal"
                  value={dolares.importeUSD}
                  onChange={(e) =>
                    setDolares((prev) => ({ ...prev, importeUSD: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className={styles.acordeonFooter}>
              <div />
              <div className={`${styles.totalSeccion} ${styles.totalSeccionYellow}`}>
                <span>Total (ARS)</span>
                <strong>{formatPesos(totalDolaresARS)}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* CHEQUES */}
        <div className={`${styles.acordeon} ${styles.acordeonPurple}`}>
          <button
            type="button"
            className={`${styles.acordeonHeader} ${styles.noPrint}`}
            onClick={() => toggleSeccion('cheques')}
            aria-expanded={seccionesAbiertas.cheques}
          >
            <span className={`${styles.acordeonIcono} ${styles.iconPurple}`}>
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"
                />
              </svg>
            </span>
            <span className={styles.acordeonTitulos}>
              <strong>Cheques</strong>
              <small>Pagos recibidos en cheque</small>
            </span>
            <span className={styles.acordeonTotal}>{formatPesos(totalCheques)}</span>
            <span className={styles.acordeonChevron}>
              {seccionesAbiertas.cheques ? '▾' : '▸'}
            </span>
          </button>
          <div
            className={`${styles.acordeonBody} ${seccionesAbiertas.cheques ? styles.acordeonBodyAbierto : ''} ${styles.noPrint}`}
          >
            <div className={`${styles.tablaHeader} ${styles.tablaHeaderPurple}`}>
              <span>Banco</span>
              <span>Nro. cheque</span>
              <span>Fecha cobro</span>
              <span>Importe</span>
              <span className={styles.colAccion} />
            </div>
            <ul className={styles.filasList}>
              {filasCheques.map((fila, index) => (
                <li key={index} className={`${styles.filaRow} ${styles.filaRowCheques}`}>
                  <input
                    type="text"
                    value={fila.banco}
                    onChange={(e) =>
                      updateFila(setFilasCheques, index, 'banco', e.target.value)
                    }
                  />
                  <input
                    type="text"
                    value={fila.nroCheque}
                    onChange={(e) =>
                      updateFila(setFilasCheques, index, 'nroCheque', e.target.value)
                    }
                  />
                  <input
                    type="date"
                    value={fila.fechaCobro}
                    onChange={(e) =>
                      updateFila(setFilasCheques, index, 'fechaCobro', e.target.value)
                    }
                  />
                  <input
                    type="text"
                    inputMode="decimal"
                    value={fila.importe}
                    onChange={(e) =>
                      updateFila(setFilasCheques, index, 'importe', e.target.value)
                    }
                    className={styles.inputImporte}
                  />
                  {renderBtnRemove(
                    () => removeFila(setFilasCheques, FILA_CHEQUES, index),
                    `Quitar fila ${index + 1} cheques`,
                  )}
                </li>
              ))}
            </ul>
            <div className={styles.acordeonFooter}>
              <button
                type="button"
                className={styles.btnAdd}
                onClick={() => addFila(setFilasCheques, FILA_CHEQUES, 'cheques')}
              >
                + Agregar fila
              </button>
              <div className={`${styles.totalSeccion} ${styles.totalSeccionPurple}`}>
                <span>Total Cheques</span>
                <strong>{formatPesos(totalCheques)}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* OBSERVACIONES */}
        <div className={`${styles.acordeon} ${styles.acordeonGray}`}>
          <button
            type="button"
            className={`${styles.acordeonHeader} ${styles.noPrint}`}
            onClick={() => toggleSeccion('observaciones')}
            aria-expanded={seccionesAbiertas.observaciones}
          >
            <span className={`${styles.acordeonIcono} ${styles.iconGray}`}>
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M3 18h18v-2H3v2zM3 6v2h18V6H3zm0 7h18v-2H3v2z"
                />
              </svg>
            </span>
            <span className={styles.acordeonTitulos}>
              <strong>Observaciones</strong>
              <small>Notas adicionales y diferencias de caja</small>
            </span>
            <span className={styles.acordeonChevron}>
              {seccionesAbiertas.observaciones ? '▾' : '▸'}
            </span>
          </button>
          <div
            className={`${styles.acordeonBody} ${seccionesAbiertas.observaciones ? styles.acordeonBodyAbierto : ''} ${styles.noPrint}`}
          >
            <label htmlFor="observaciones" className={styles.obsLabel}>
              Detalle de observaciones
            </label>
            <textarea
              id="observaciones"
              className={styles.textareaObs}
              placeholder="Ingrese observaciones, faltantes o sobrantes detectados..."
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className={styles.resumenGeneral}>
        <h3>
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path
              fill="currentColor"
              d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"
            />
          </svg>
          Resumen General del Turno
        </h3>
        <div className={styles.totalesRendirGrid}>
          <div>
            <span>Total guardia (sistema)</span>
            <strong>{formatPesos(totalGuardiaSuperiorNum)}</strong>
          </div>
          <div>
            <span>Total internación</span>
            <strong>{formatPesos(totalInternaciones)}</strong>
          </div>
          <div>
            <span>Rendición varios</span>
            <strong>{formatPesos(totalRendicion)}</strong>
          </div>
          <div>
            <span>Cheques</span>
            <strong>{formatPesos(totalCheques)}</strong>
          </div>
          <div>
            <span>Dólares en caución</span>
            <strong>{formatPesos(totalDolaresARS)}</strong>
          </div>
          <div className={styles.totalARendirCelda}>
            <span>Total a rendir</span>
            <strong>{formatPesos(totalARendir)}</strong>
          </div>
        </div>
        <ul className={styles.resumenLista}>
          <li>
            <span className={`${styles.resumenDot} ${styles.dotBlue}`} />
            <span>Detalle Ticket (cómo se cobró)</span>
            <strong>{formatPesos(totalGuardiaAcordeon)}</strong>
          </li>
          <li>
            <span className={`${styles.resumenDot} ${styles.dotGreen}`} />
            <span>Internaciones (qué se cobró; ya va en el ticket)</span>
            <strong>{formatPesos(totalInternaciones)}</strong>
          </li>
          <li>
            <span className={`${styles.resumenDot} ${styles.dotOrange}`} />
            <span>Rendición Varios (qué se cobró; ya va en el ticket)</span>
            <strong>{formatPesos(totalRendicion)}</strong>
          </li>
          <li>
            <span className={`${styles.resumenDot} ${styles.dotYellow}`} />
            <span>
              Dólares en Caución{' '}
              <small>
                {formatUSD(totalDolaresUSD)} ({formatPesos(totalDolaresARS)} ARS)
              </small>
            </span>
            <strong>{formatPesos(totalDolaresARS)}</strong>
          </li>
          <li>
            <span className={`${styles.resumenDot} ${styles.dotPurple}`} />
            <span>Cheques</span>
            <strong>{formatPesos(totalCheques)}</strong>
          </li>
        </ul>
        <div className={`${styles.totalGeneralBar} ${styles.totalDepositadoBar}`}>
          <span>Total depositado</span>
          <strong>{formatPesos(totalDepositado)}</strong>
        </div>
        <div className={styles.totalGeneralBar}>
          <span>Diferencia</span>
          <strong>{formatDiferencia(diferencia)}</strong>
        </div>
        <div className={`${styles.totalGeneralBar} ${styles.totalDolaresBar}`}>
          <span>Diferencia dólares</span>
          <strong>{formatDiferenciaUSD(diferenciaDolares)}</strong>
        </div>
      </div>

      <div className={styles.printDetalle}>
        <div className={styles.printDatosTurno}>
          <p>
            <strong>Responsable:</strong> {nombreApellido || '—'}
          </p>
          <p>
            <strong>Fecha del turno:</strong> {formatFecha(fechaTurno)}
          </p>
          <p>
            <strong>Nº de precinto:</strong> {numeroPrecinto || '—'}
          </p>
          <p>
            <strong>Turno:</strong> {turno || '—'}
          </p>
        </div>

        {(filaEfectivoDeposito.numTicket.trim() ||
          parseMonto(filaEfectivoDeposito.importe) != null ||
          filasConDatos(filasGuardia, ['nombreApellido', 'numTicket']).length > 0) && (
          <table className={styles.tablaPrint}>
            <caption>Detalle Ticket</caption>
            <thead>
              <tr>
                <th>Nombre y apellido</th>
                <th>Nº ticket</th>
                <th>Importe</th>
              </tr>
            </thead>
            <tbody>
              {(filaEfectivoDeposito.numTicket.trim() ||
                parseMonto(filaEfectivoDeposito.importe) != null) && (
                <tr>
                  <td>EFECTIVO/DEPOSITO</td>
                  <td>{filaEfectivoDeposito.numTicket || '—'}</td>
                  <td>{formatPesos(parseMonto(filaEfectivoDeposito.importe))}</td>
                </tr>
              )}
              {filasConDatos(filasGuardia, ['nombreApellido', 'numTicket']).map((f, i) => (
                <tr key={i}>
                  <td>{f.nombreApellido || '—'}</td>
                  <td>{f.numTicket || '—'}</td>
                  <td>{formatPesos(parseMonto(f.importe))}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={2}>Total Detalle Ticket</td>
                <td>{formatPesos(totalGuardiaAcordeon)}</td>
              </tr>
            </tfoot>
          </table>
        )}

        {filasConDatos(filasInternaciones, ['paciente', 'numeroInternado', 'concepto', 'recibo'])
          .length > 0 && (
          <table className={styles.tablaPrint}>
            <caption>Internaciones</caption>
            <thead>
              <tr>
                <th>Paciente</th>
                <th>Número internado</th>
                <th>Concepto</th>
                <th>Recibo</th>
                <th>Importe</th>
              </tr>
            </thead>
            <tbody>
              {filasConDatos(filasInternaciones, [
                'paciente',
                'numeroInternado',
                'concepto',
                'recibo',
              ]).map((f, i) => (
                <tr key={i}>
                  <td>{f.paciente || '—'}</td>
                  <td>{f.numeroInternado || '—'}</td>
                  <td>{f.concepto || '—'}</td>
                  <td>{f.recibo || '—'}</td>
                  <td>{formatPesos(parseMonto(f.importe))}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4}>Total Internaciones</td>
                <td>{formatPesos(totalInternaciones)}</td>
              </tr>
            </tfoot>
          </table>
        )}

        {filasConDatos(filasRendicion, ['paciente', 'concepto', 'recibo', 'factura']).length >
          0 && (
          <table className={styles.tablaPrint}>
            <caption>Rendición Varios</caption>
            <thead>
              <tr>
                <th>Paciente</th>
                <th>Concepto</th>
                <th>Recibo</th>
                <th>Factura</th>
                <th>Importe</th>
              </tr>
            </thead>
            <tbody>
              {filasConDatos(filasRendicion, [
                'paciente',
                'concepto',
                'recibo',
                'factura',
              ]).map((f, i) => (
                <tr key={i}>
                  <td>{f.paciente || '—'}</td>
                  <td>{f.concepto || '—'}</td>
                  <td>{f.recibo || '—'}</td>
                  <td>{f.factura || '—'}</td>
                  <td>{formatPesos(parseMonto(f.importe))}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4}>Total Varios</td>
                <td>{formatPesos(totalRendicion)}</td>
              </tr>
            </tfoot>
          </table>
        )}

        {(dolares.nombreApellido ||
          dolares.numRecibo ||
          dolares.importeUSD ||
          dolares.cambioDelDia) && (
          <table className={styles.tablaPrint}>
            <caption>Dólares en Caución</caption>
            <tbody>
              <tr>
                <td>Nombre</td>
                <td>{dolares.nombreApellido || '—'}</td>
              </tr>
              <tr>
                <td>Nº recibo</td>
                <td>{dolares.numRecibo || '—'}</td>
              </tr>
              <tr>
                <td>Importe USD</td>
                <td>{formatUSD(totalDolaresUSD)}</td>
              </tr>
              <tr>
                <td>Cambio del día</td>
                <td>{formatPesos(parseMonto(dolares.cambioDelDia))}</td>
              </tr>
              <tr>
                <td>Total ARS</td>
                <td>{formatPesos(totalDolaresARS)}</td>
              </tr>
            </tbody>
          </table>
        )}

        {filasConDatos(filasCheques, ['banco', 'nroCheque', 'fechaCobro']).length > 0 && (
          <table className={styles.tablaPrint}>
            <caption>Cheques</caption>
            <thead>
              <tr>
                <th>Banco</th>
                <th>Nro. cheque</th>
                <th>Fecha cobro</th>
                <th>Importe</th>
              </tr>
            </thead>
            <tbody>
              {filasConDatos(filasCheques, ['banco', 'nroCheque', 'fechaCobro']).map(
                (f, i) => (
                  <tr key={i}>
                    <td>{f.banco || '—'}</td>
                    <td>{f.nroCheque || '—'}</td>
                    <td>{formatFecha(f.fechaCobro)}</td>
                    <td>{formatPesos(parseMonto(f.importe))}</td>
                  </tr>
                ),
              )}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3}>Total Cheques</td>
                <td>{formatPesos(totalCheques)}</td>
              </tr>
            </tfoot>
          </table>
        )}

        {observaciones.trim() && (
          <div className={styles.printObs}>
            <strong>Observaciones:</strong>
            <p>{observaciones}</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Caja;
