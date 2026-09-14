import { useMemo, useState } from 'react';
import { encode } from 'uqr';
import styles from './Pulseras.module.css';
import logo from '../../assets/allende.jpg';

const TAMANOS = [
  { id: 'neonato', label: 'Neonato', largoMm: 150, altoMm: 25 },
  { id: 'pediatrico', label: 'Pediátrico', largoMm: 180, altoMm: 25 },
  { id: 'adulto', label: 'Adulto', largoMm: 279, altoMm: 29 },
];

const hoyISO = () => new Date().toISOString().slice(0, 10);

const formatFecha = (iso) => {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
};

const formatDni = (str) => {
  const digits = String(str).replace(/\D/g, '');
  if (!digits) return '';
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const edadDesdeISO = (iso) => {
  if (!iso) return null;
  const nac = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(nac.getTime())) return null;
  const hoy = new Date();
  let edad = hoy.getFullYear() - nac.getFullYear();
  const mes = hoy.getMonth() - nac.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < nac.getDate())) edad -= 1;
  return edad >= 0 ? edad : null;
};

const QrSvg = ({ value, label }) => {
  const qr = useMemo(() => {
    if (!value) return null;
    return encode(value, { ecc: 'M', border: 2 });
  }, [value]);

  if (!qr) {
    return <div className={styles.qrVacio} aria-hidden="true" />;
  }

  const { size, data } = qr;

  return (
    <div className={styles.qrWrap}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`0 0 ${size} ${size}`}
        className={styles.qrSvg}
        role="img"
        aria-label={`QR ${label || value}`}
      >
        <rect width={size} height={size} fill="#fff" />
        {data.map((row, y) =>
          row.map((on, x) =>
            on ? (
              <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="#000" />
            ) : null,
          ),
        )}
      </svg>
    </div>
  );
};

const ModuloPulsera = ({ datos }) => (
  <div className={styles.modulo}>
    <div className={styles.marca}>
      <img src={logo} alt="Sanatorio Allende" className={styles.logoImg} />
    </div>
    <div className={styles.identidad}>
      <p className={styles.marcaNombre}>SANATORIO ALLENDE</p>
      <p className={styles.nombre}>{datos.apellidoNombres || 'NOMBRE Y APELLIDO'}</p>
      {datos.tieneInternado ? (
        <p className={styles.internado}>INTERNADO {datos.numeroInternado}</p>
      ) : null}
      {datos.nivel ? (
        <p className={styles.internado}>
          <span className={styles.nivel}>NIVEL {datos.nivel}</span>
        </p>
      ) : null}
      <p className={styles.metaLine}>
        <span>
          <em>DNI</em> {datos.documento || '—'}
        </span>
        <span>
          <em>NAC</em> {formatFecha(datos.fechaNacimiento)}
        </span>
        <span>
          <em>EDAD</em> {datos.edad != null ? `${datos.edad} AÑOS` : '—'}
        </span>
      </p>
    </div>
    <QrSvg value={datos.qrValue} label={datos.qrLabel} />
  </div>
);

const PulseraPreview = ({ datos, tamano }) => (
  <div
    className={styles.pulsera}
    style={{
      '--pulsera-w': `${tamano.largoMm}mm`,
      '--pulsera-h': `${tamano.altoMm}mm`,
    }}
  >
    <ModuloPulsera datos={datos} />
  </div>
);

const Pulseras = () => {
  const [tamanoId, setTamanoId] = useState('neonato');
  const [apellidoNombres, setApellidoNombres] = useState('');
  const [documento, setDocumento] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [numeroInternado, setNumeroInternado] = useState('');
  const [nivel, setNivel] = useState('');

  const tamano = TAMANOS.find((t) => t.id === tamanoId) ?? TAMANOS[0];
  const edad = edadDesdeISO(fechaNacimiento);
  const internadoValor = numeroInternado.trim().toUpperCase();
  const hayInternado = Boolean(internadoValor);
  const hayNivel = nivel === '2' || nivel === '3';
  const puedeImprimir = Boolean(apellidoNombres.trim());

  const onInternadoChange = (value) => {
    setNumeroInternado(value);
    if (value.trim()) setNivel('');
  };

  const onNivelChange = (value) => {
    setNivel(value);
    if (value) setNumeroInternado('');
  };

  const datos = {
    apellidoNombres: apellidoNombres.trim().toUpperCase(),
    documento: formatDni(documento) || '—',
    fechaNacimiento,
    edad,
    tieneInternado: hayInternado,
    numeroInternado: internadoValor,
    nivel: hayNivel ? nivel : '',
    qrValue: internadoValor || documento.replace(/\D/g, ''),
    qrLabel: internadoValor,
  };

  const limpiar = () => {
    setApellidoNombres('');
    setDocumento('');
    setFechaNacimiento('');
    setNumeroInternado('');
    setNivel('');
  };

  const imprimir = () => {
    if (!puedeImprimir) return;
    const alTerminar = () => {
      window.removeEventListener('afterprint', alTerminar);
      limpiar();
    };
    window.addEventListener('afterprint', alTerminar);
    window.print();
  };

  return (
    <section className={styles.wrapper}>
      <style>
        {`@media print { @page { size: ${tamano.largoMm}mm ${tamano.altoMm}mm; margin: 0; } }`}
      </style>

      <div className={styles.noPrint}>
        <p className={styles.kicker}>Formulario de gestión</p>
        <h2 className={styles.titulo}>Ingreso de Paciente</h2>
        <p className={styles.subtitulo}>
          Completá los datos personales y de internación para registrar al paciente en el
          sistema.
        </p>

        <form
          className={styles.card}
          onSubmit={(e) => {
            e.preventDefault();
            imprimir();
          }}
        >
          <div className={styles.cardHead}>
            <h3>Información del Paciente</h3>
            <span className={styles.badge}>Admisión activa</span>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="pulsera-nombre">Nombre y Apellido</label>
            <input
              id="pulsera-nombre"
              value={apellidoNombres}
              onChange={(e) => setApellidoNombres(e.target.value)}
              autoComplete="name"
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="pulsera-dni">DNI / Documento</label>
            <input
              id="pulsera-dni"
              value={documento}
              onChange={(e) => setDocumento(e.target.value)}
              inputMode="numeric"
            />
          </div>
          <div className={styles.fila2}>
            <div className={styles.inputGroup}>
              <label htmlFor="pulsera-nac">Fecha de nac.</label>
              <input
                id="pulsera-nac"
                type="date"
                max={hoyISO()}
                value={fechaNacimiento}
                onChange={(e) => setFechaNacimiento(e.target.value)}
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="pulsera-edad">Edad</label>
              <input
                id="pulsera-edad"
                readOnly
                value={edad != null ? `${edad} años` : ''}
                placeholder="—"
              />
            </div>
          </div>
          <div className={styles.fila2}>
            <div className={styles.inputGroup}>
              <label htmlFor="pulsera-internado">N° Internado</label>
              <input
                id="pulsera-internado"
                value={numeroInternado}
                onChange={(e) => onInternadoChange(e.target.value)}
                disabled={hayNivel}
                placeholder={hayNivel ? 'No se usa con nivel 2/3' : ''}
              />
            </div>
            <div className={styles.inputGroup}>
              <span className={styles.nivelLabel}>Nivel</span>
              <div className={styles.nivelOpciones}>
                <label className={styles.radioNivel}>
                  <input
                    type="radio"
                    name="pulsera-nivel"
                    checked={!hayNivel}
                    onChange={() => onNivelChange('')}
                    disabled={hayInternado}
                  />
                  Ninguno
                </label>
                <label className={styles.radioNivel}>
                  <input
                    type="radio"
                    name="pulsera-nivel"
                    checked={nivel === '2'}
                    onChange={() => onNivelChange('2')}
                    disabled={hayInternado}
                  />
                  Nivel 2
                </label>
                <label className={styles.radioNivel}>
                  <input
                    type="radio"
                    name="pulsera-nivel"
                    checked={nivel === '3'}
                    onChange={() => onNivelChange('3')}
                    disabled={hayInternado}
                  />
                  Nivel 3
                </label>
              </div>
              <small className={styles.hintInternado}>
                Internado o nivel: no se combinan
              </small>
            </div>
          </div>
        </form>

        <div className={styles.card}>
          <div className={styles.cardHead}>
            <h3>
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14H6v-2h6v2zm6-4H6v-2h12v2zm0-4H6V7h12v2z"
                />
              </svg>
              Acciones de Ingreso
            </h3>
            <span className={`${styles.badge} ${puedeImprimir ? styles.badgeOk : ''}`}>
              {puedeImprimir ? 'Listo para emitir' : 'Completar datos'}
            </span>
          </div>

          <div className={styles.previewHead}>
            <span>
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h10v2H4v-2z"
                />
              </svg>
              Vista previa de pulsera identificatoria
            </span>
            <div className={styles.tamanos}>
              {TAMANOS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={tamanoId === t.id ? styles.tamanoActivo : styles.tamanoBtn}
                  onClick={() => setTamanoId(t.id)}
                >
                  {t.altoMm}×{t.largoMm}mm
                </button>
              ))}
            </div>
          </div>

          <div className={styles.previewFrame}>
            <PulseraPreview datos={datos} tamano={tamano} />
          </div>

          <div className={styles.accionesPrint}>
            <button type="button" className={styles.btnLimpiar} onClick={limpiar}>
              Limpiar formulario
            </button>
            <button
              type="button"
              className={styles.btnPrint}
              onClick={imprimir}
              disabled={!puedeImprimir}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"
                />
              </svg>
              Imprimir pulsera
            </button>
          </div>
        </div>
      </div>

      <div className={styles.printOnly}>
        <PulseraPreview datos={datos} tamano={tamano} />
      </div>
    </section>
  );
};

export default Pulseras;
