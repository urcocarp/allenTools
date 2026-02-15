import { useState, useMemo } from 'react';
import styles from './IvaCalculator.module.css';

const ALICUOTAS = [
  { valor: 21, divisor: 1.21, label: '21%' },
  { valor: 10.5, divisor: 1.105, label: '10,5%' },
];

const formatPesos = (n) => {
  if (n == null || Number.isNaN(n)) return '–';
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
};

const IvaCalculator = () => {
  const [montoTotal, setMontoTotal] = useState('');
  const [alicuotaIndex, setAlicuotaIndex] = useState(0);

  const { divisor, valor } = ALICUOTAS[alicuotaIndex];
  const totalNum = useMemo(() => {
    const t = parseFloat(String(montoTotal).replace(',', '.').trim());
    return Number.isFinite(t) && t >= 0 ? t : null;
  }, [montoTotal]);

  const { neto, iva } = useMemo(() => {
    if (totalNum == null) return { neto: null, iva: null };
    const neto = totalNum / divisor;
    const iva = neto * (valor / 100);
    return { neto, iva };
  }, [totalNum, divisor, valor]);

  const controlOk = useMemo(() => {
    if (neto == null || iva == null) return null;
    return Math.abs(neto + iva - totalNum) < 0.02;
  }, [neto, iva, totalNum]);

  return (
    <section className={styles.wrapper}>
      <h2 className={styles.titulo}>Calculadora IVA (Factura B o C)</h2>
      <p className={styles.subtitulo}>
        Ingresá el <strong>total</strong> de la factura (IVA incluido). Te mostramos el neto y el IVA contenido para Transparencia Fiscal (Ley 27.743).
      </p>

      <div className={styles.alicuota}>
        <span className={styles.alicuotaLabel}>Alícuota:</span>
        {ALICUOTAS.map((a, i) => (
          <label key={a.valor} className={styles.radioLabel}>
            <input
              type="radio"
              name="alicuota"
              checked={alicuotaIndex === i}
              onChange={() => setAlicuotaIndex(i)}
            />
            {a.label}
          </label>
        ))}
      </div>

      <div className={styles.inputGroup}>
        <label htmlFor="monto-total">Total facturado (con IVA)</label>
        <input
          id="monto-total"
          type="text"
          inputMode="decimal"
          placeholder="Ej: 12100"
          value={montoTotal}
          onChange={(e) => setMontoTotal(e.target.value)}
        />
      </div>

      <div className={styles.resultados}>
        <div className={styles.filaResultado}>
          <span>Importe neto (sin IVA)</span>
          <strong>{formatPesos(neto)}</strong>
        </div>
        <div className={styles.filaResultado}>
          <span>IVA contenido ({valor}%)</span>
          <strong className={styles.ivaContenido}>{formatPesos(iva)}</strong>
        </div>
        {totalNum != null && (
          <div className={styles.filaResultado}>
            <span>Control (neto + IVA)</span>
            <strong className={controlOk ? styles.ok : styles.warn}>
              {formatPesos(neto != null && iva != null ? neto + iva : null)}
            </strong>
          </div>
        )}
      </div>

      {iva != null && iva > 0 && (
        <div className={styles.transparencia}>
          <p>Transparencia Fiscal al Consumidor (Ley 27.743)</p>
          <p className={styles.ivaContenidoLinea}>IVA contenido: {formatPesos(iva)}</p>
        </div>
      )}
    </section>
  );
};

export default IvaCalculator;
