import { useState, useMemo, useRef } from 'react';
import styles from './Caja.module.css';
import logo from '../../assets/allende.jpg';

const FILA_VACIA = {
  nombreApellido: '',
  concepto: '',
  numRecibo: '',
  formaPago: '',
  importe: '',
};

const FORMAS_PAGO = [
  'Efectivo',
  'Tarjeta débito',
  'Tarjeta crédito',
  'Transferencia',
  'Mercado Pago',
  'Cheque',
  'Otro',
];

const SECCIONES = [
  {
    id: 'guardia',
    titulo: 'Guardia',
    subtitulo: 'Cobros del servicio de guardia',
    color: 'blue',
    icono: '🛡️',
    isUSD: false,
  },
  {
    id: 'internaciones',
    titulo: 'Internaciones',
    subtitulo: 'Cobros por internación',
    color: 'green',
    icono: '🏥',
    isUSD: false,
  },
  {
    id: 'rendicion',
    titulo: 'Rendición Varios',
    subtitulo: 'Cobros varios / misceláneos',
    color: 'orange',
    icono: '📄',
    isUSD: false,
  },
  {
    id: 'dolares',
    titulo: 'Dólares en Caución',
    subtitulo: 'Depósitos en dólares',
    color: 'yellow',
    icono: '💵',
    isUSD: true,
  },
  {
    id: 'cheques',
    titulo: 'Cheques',
    subtitulo: 'Pagos recibidos en cheques',
    color: 'purple',
    icono: '📝',
    isUSD: false,
  },
];

const crearFilasIniciales = () =>
  SECCIONES.reduce((acc, { id }) => {
    acc[id] = [{ ...FILA_VACIA }];
    return acc;
  }, {});

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

const formatFecha = (iso) => {
  if (!iso) return '–';
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
};

const sumarFilas = (filas) =>
  filas.reduce((acc, fila) => {
    const valor = parseMonto(fila.importe);
    return valor != null ? acc + valor : acc;
  }, 0);

const filasConDatos = (filas) =>
  filas.filter(
    (f) =>
      f.nombreApellido.trim() ||
      f.concepto.trim() ||
      f.numRecibo.trim() ||
      f.formaPago ||
      parseMonto(f.importe) != null,
  );

const Caja = () => {
  const printTimestampRef = useRef(null);

  const [nombreApellido, setNombreApellido] = useState('');
  const [fechaTurno, setFechaTurno] = useState(hoyISO);
  const [numeroPrecinto, setNumeroPrecinto] = useState('');
  const [turno, setTurno] = useState('');
  const [cotizacionUSD, setCotizacionUSD] = useState('');
  const [seccionesAbiertas, setSeccionesAbiertas] = useState({ guardia: true });
  const [filas, setFilas] = useState(crearFilasIniciales);

  const cotizacionNum = useMemo(() => parseMonto(cotizacionUSD), [cotizacionUSD]);

  const totales = useMemo(() => {
    const result = {};
    SECCIONES.forEach(({ id }) => {
      result[id] = sumarFilas(filas[id]);
    });
    return result;
  }, [filas]);

  const dolaresARS = useMemo(() => {
    if (totales.dolares === 0) return 0;
    if (cotizacionNum == null) return null;
    return totales.dolares * cotizacionNum;
  }, [totales.dolares, cotizacionNum]);

  const totalGeneral = useMemo(() => {
    const restas = totales.internaciones + totales.rendicion + totales.cheques;
    const dolares = dolaresARS ?? 0;
    return totales.guardia - restas - dolares;
  }, [totales, dolaresARS]);

  const toggleSeccion = (id) => {
    setSeccionesAbiertas((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const updateFila = (seccionId, index, field, value) => {
    setFilas((prev) => ({
      ...prev,
      [seccionId]: prev[seccionId].map((fila, i) =>
        i === index ? { ...fila, [field]: value } : fila,
      ),
    }));
  };

  const addFila = (seccionId) => {
    setFilas((prev) => ({
      ...prev,
      [seccionId]: [...prev[seccionId], { ...FILA_VACIA }],
    }));
    setSeccionesAbiertas((prev) => ({ ...prev, [seccionId]: true }));
  };

  const removeFila = (seccionId, index) => {
    setFilas((prev) => ({
      ...prev,
      [seccionId]:
        prev[seccionId].length <= 1
          ? [{ ...FILA_VACIA }]
          : prev[seccionId].filter((_, i) => i !== index),
    }));
  };

  const limpiar = () => {
    setNombreApellido('');
    setFechaTurno(hoyISO());
    setNumeroPrecinto('');
    setTurno('');
    setCotizacionUSD('');
    setSeccionesAbiertas({ guardia: true });
    setFilas(crearFilasIniciales());
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

  const renderTotalSeccion = (seccion) => {
    const total = totales[seccion.id];
    if (seccion.isUSD) return formatUSD(total);
    return formatPesos(total);
  };

  const renderTablaFilas = (seccionId, { soloImpresion = false } = {}) => {
    const seccion = SECCIONES.find((s) => s.id === seccionId);
    const filasMostrar = filasConDatos(filas[seccionId]);
    if (filasMostrar.length === 0) return null;

    return (
      <table
        key={seccionId}
        className={soloImpresion ? styles.tablaPrint : styles.tablaSeccion}
      >
        <caption>{seccion.titulo}</caption>
        <thead>
          <tr>
            <th>Nombre y apellido</th>
            <th>Concepto</th>
            <th>Nº recibo</th>
            <th>Forma de pago</th>
            <th>Importe</th>
          </tr>
        </thead>
        <tbody>
          {filasMostrar.map((fila, i) => (
            <tr key={i}>
              <td>{fila.nombreApellido || '—'}</td>
              <td>{fila.concepto || '—'}</td>
              <td>{fila.numRecibo || '—'}</td>
              <td>{fila.formaPago || '—'}</td>
              <td>
                {seccion.isUSD
                  ? formatUSD(parseMonto(fila.importe))
                  : formatPesos(parseMonto(fila.importe))}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={4}>Total {seccion.titulo}</td>
            <td>{renderTotalSeccion(seccion)}</td>
          </tr>
        </tfoot>
      </table>
    );
  };

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
          <span className={styles.fechaHoy}>{formatFecha(fechaTurno)}</span>
          <button type="button" className={styles.btnLimpiar} onClick={limpiar}>
            Limpiar
          </button>
          <button type="button" className={styles.btnPrint} onClick={handlePrint}>
            Imprimir cierre
          </button>
        </div>
      </div>

      <fieldset className={`${styles.intro} ${styles.noPrint}`}>
        <div className={styles.introGrid}>
          <div className={styles.inputGroup}>
            <label htmlFor="nombre-apellido">Nombre y apellido</label>
            <input
              id="nombre-apellido"
              type="text"
              placeholder="Ej: García, Juan"
              value={nombreApellido}
              onChange={(e) => setNombreApellido(e.target.value)}
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="fecha-turno">Fecha del turno</label>
            <input
              id="fecha-turno"
              type="date"
              value={fechaTurno}
              onChange={(e) => setFechaTurno(e.target.value)}
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="numero-precinto">Nº de precinto</label>
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
            <input
              id="turno"
              type="text"
              placeholder="Ej: Mañana / Tarde / Noche"
              value={turno}
              onChange={(e) => setTurno(e.target.value)}
            />
          </div>
        </div>
      </fieldset>

      <div className={styles.acordeones}>
        {SECCIONES.map((seccion) => {
          const abierta = seccionesAbiertas[seccion.id];
          const filasSeccion = filas[seccion.id];

          return (
            <div
              key={seccion.id}
              className={`${styles.acordeon} ${styles[`acordeon${seccion.color}`]}`}
            >
              <button
                type="button"
                className={`${styles.acordeonHeader} ${styles.noPrint}`}
                onClick={() => toggleSeccion(seccion.id)}
                aria-expanded={abierta}
              >
                <span className={styles.acordeonIcono}>{seccion.icono}</span>
                <span className={styles.acordeonTitulos}>
                  <strong>{seccion.titulo}</strong>
                  <small>{seccion.subtitulo}</small>
                </span>
                <span className={styles.acordeonTotal}>{renderTotalSeccion(seccion)}</span>
                <span className={styles.acordeonChevron}>{abierta ? '▾' : '▸'}</span>
              </button>

              <div
                className={`${styles.acordeonBody} ${abierta ? styles.acordeonBodyAbierto : ''} ${styles.noPrint}`}
              >
                {seccion.isUSD && (
                  <div className={styles.cotizacionRow}>
                    <label htmlFor="cotizacion-usd">Cotización USD (ARS)</label>
                    <input
                      id="cotizacion-usd"
                      type="text"
                      inputMode="decimal"
                      placeholder="Ej: 1.050,00"
                      value={cotizacionUSD}
                      onChange={(e) => setCotizacionUSD(e.target.value)}
                    />
                    {totales.dolares > 0 && cotizacionNum != null && (
                      <span className={styles.cotizacionEquiv}>
                        = {formatPesos(dolaresARS)}
                      </span>
                    )}
                  </div>
                )}

                <div className={styles.filaLabels} aria-hidden="true">
                  <span>Nombre y apellido</span>
                  <span>Concepto</span>
                  <span>Nº recibo</span>
                  <span>Forma de pago</span>
                  <span>Importe</span>
                  <span className={styles.colAccion} />
                </div>

                <ul className={styles.filasList}>
                  {filasSeccion.map((fila, index) => (
                    <li key={index} className={styles.filaRow}>
                      <input
                        type="text"
                        placeholder="Nombre"
                        value={fila.nombreApellido}
                        onChange={(e) =>
                          updateFila(seccion.id, index, 'nombreApellido', e.target.value)
                        }
                        aria-label={`Nombre fila ${index + 1} ${seccion.titulo}`}
                      />
                      <input
                        type="text"
                        placeholder="Concepto"
                        value={fila.concepto}
                        onChange={(e) =>
                          updateFila(seccion.id, index, 'concepto', e.target.value)
                        }
                        aria-label={`Concepto fila ${index + 1} ${seccion.titulo}`}
                      />
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="Recibo"
                        value={fila.numRecibo}
                        onChange={(e) =>
                          updateFila(seccion.id, index, 'numRecibo', e.target.value)
                        }
                        aria-label={`Recibo fila ${index + 1} ${seccion.titulo}`}
                      />
                      <select
                        value={fila.formaPago}
                        onChange={(e) =>
                          updateFila(seccion.id, index, 'formaPago', e.target.value)
                        }
                        aria-label={`Forma de pago fila ${index + 1} ${seccion.titulo}`}
                      >
                        <option value="">Seleccionar…</option>
                        {FORMAS_PAGO.map((fp) => (
                          <option key={fp} value={fp}>
                            {fp}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        inputMode="decimal"
                        placeholder={seccion.isUSD ? 'USD' : '0,00'}
                        value={fila.importe}
                        onChange={(e) =>
                          updateFila(seccion.id, index, 'importe', e.target.value)
                        }
                        aria-label={`Importe fila ${index + 1} ${seccion.titulo}`}
                        className={styles.inputImporte}
                      />
                      <button
                        type="button"
                        className={styles.btnRemove}
                        onClick={() => removeFila(seccion.id, index)}
                        aria-label={`Quitar fila ${index + 1}`}
                        title="Quitar"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>

                <div className={styles.acordeonFooter}>
                  <button
                    type="button"
                    className={styles.btnAdd}
                    onClick={() => addFila(seccion.id)}
                  >
                    + Agregar fila
                  </button>
                  <div className={styles.totalSeccion}>
                    <span>Total {seccion.titulo}</span>
                    <strong>{renderTotalSeccion(seccion)}</strong>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className={`${styles.resumenGeneral} ${styles.noPrint}`}>
        <h3>Resumen General del Turno</h3>
        <ul className={styles.resumenLista}>
          <li>
            <span className={`${styles.resumenDot} ${styles.dotBlue}`} />
            <span>Guardia</span>
            <strong>{formatPesos(totales.guardia)}</strong>
          </li>
          <li>
            <span className={`${styles.resumenDot} ${styles.dotGreen}`} />
            <span>Internaciones</span>
            <strong>− {formatPesos(totales.internaciones)}</strong>
          </li>
          <li>
            <span className={`${styles.resumenDot} ${styles.dotOrange}`} />
            <span>Rendición Varios</span>
            <strong>− {formatPesos(totales.rendicion)}</strong>
          </li>
          <li>
            <span className={`${styles.resumenDot} ${styles.dotYellow}`} />
            <span>
              Dólares en Caución{' '}
              <small>
                {formatUSD(totales.dolares)}
                {dolaresARS != null ? ` (${formatPesos(dolaresARS)} ARS)` : ''}
              </small>
            </span>
            <strong>− {formatPesos(dolaresARS ?? 0)}</strong>
          </li>
          <li>
            <span className={`${styles.resumenDot} ${styles.dotPurple}`} />
            <span>Cheques</span>
            <strong>− {formatPesos(totales.cheques)}</strong>
          </li>
        </ul>
        <div className={styles.totalGeneralBar}>
          <span>Total General (ARS)</span>
          <strong>{formatPesos(totalGeneral)}</strong>
        </div>
        <p className={styles.formulaHint}>
          Total General = Guardia − Internaciones − Rendición Varios − Cheques − Dólares (ARS)
        </p>
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
          {cotizacionNum != null && (
            <p>
              <strong>Cotización USD:</strong> {formatPesos(cotizacionNum)}
            </p>
          )}
        </div>

        {SECCIONES.map((seccion) => renderTablaFilas(seccion.id, { soloImpresion: true }))}

        <div className={styles.resumenPrint}>
          <h3>Resumen General del Turno</h3>
          <table className={styles.tablaResumenPrint}>
            <tbody>
              <tr>
                <td>Guardia</td>
                <td>{formatPesos(totales.guardia)}</td>
              </tr>
              <tr>
                <td>Internaciones</td>
                <td>− {formatPesos(totales.internaciones)}</td>
              </tr>
              <tr>
                <td>Rendición Varios</td>
                <td>− {formatPesos(totales.rendicion)}</td>
              </tr>
              <tr>
                <td>
                  Dólares en Caución ({formatUSD(totales.dolares)}
                  {dolaresARS != null ? ` = ${formatPesos(dolaresARS)}` : ''})
                </td>
                <td>− {formatPesos(dolaresARS ?? 0)}</td>
              </tr>
              <tr>
                <td>Cheques</td>
                <td>− {formatPesos(totales.cheques)}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td>Total General (ARS)</td>
                <td>{formatPesos(totalGeneral)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </section>
  );
};

export default Caja;
