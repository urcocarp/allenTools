import { useState, Fragment } from 'react';
import styles from './TablaRegistros.module.css';

const formatFecha = (iso) => {
  try {
    return new Date(iso).toLocaleString('es-AR', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  } catch {
    return iso ?? '—';
  }
};

const TablaRegistros = ({ registros, onClear, onDelete }) => {
  const [expandido, setExpandido] = useState(null);

  if (!registros?.length) {
    return (
      <section className={styles.wrapper}>
        <p className={styles.vacio}>Aún no hay registros. Guardá uno desde el formulario.</p>
      </section>
    );
  }

  return (
    <section className={styles.wrapper}>
      <div className={styles.header}>
        <h2 className={styles.titulo}>Registros guardados ({registros.length})</h2>
        {onClear && (
          <button type="button" onClick={onClear} className={styles.btnClear}>
            Vaciar tabla
          </button>
        )}
      </div>
      <div className={styles.scroll}>
        <table className={styles.tabla}>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Apellido y nombres</th>
              <th>Documento</th>
              <th>Edad</th>
              <th>Teléfono</th>
              <th>Obra social</th>
              <th>Diagnóstico</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {[...registros].reverse().map((r) => (
              <Fragment key={r.id}>
                <tr className={styles.fila}>
                  <td>{formatFecha(r.createdAt)}</td>
                  <td>{r.apellidoNombres || '—'}</td>
                  <td>{r.documento || '—'}</td>
                  <td>{r.edad || '—'}</td>
                  <td>{r.telefono || '—'}</td>
                  <td>{r.obraSocial || '—'}</td>
                  <td>{r.diagnostico || '—'}</td>
                  <td className={styles.celdasAcciones}>
                    <button
                      type="button"
                      className={styles.btnVer}
                      onClick={() => setExpandido(expandido === r.id ? null : r.id)}
                      aria-expanded={expandido === r.id}
                    >
                      {expandido === r.id ? 'Ocultar' : 'Ver más'}
                    </button>
                    {onDelete && (
                      <button
                        type="button"
                        className={styles.btnEliminar}
                        onClick={() => {
                          if (window.confirm('¿Eliminar este registro?')) onDelete(r.id);
                        }}
                        title="Eliminar registro"
                      >
                        Eliminar
                      </button>
                    )}
                  </td>
                </tr>
                {expandido === r.id && (
                  <tr className={styles.filaDetalle}>
                    <td colSpan={8}>
                      <div className={styles.detalle}>
                        <p><strong>Lugar:</strong> {r.lugar || '—'}</p>
                        <p><strong>Plan:</strong> {r.plan || '—'}</p>
                        <p><strong>Politraumatismo:</strong> {r.politraumatismo || '—'}</p>
                        <p><strong>Observaciones:</strong> {r.observaciones || '—'}</p>
                        <p><strong>FC / FR / Glasgow / SAT / TA / Temp:</strong> {[r.fc, r.fr, r.glasgow, r.sat, r.ta, r.temperatura].filter(Boolean).join(' — ') || '—'}</p>
                        <p><strong>Tubo oxígeno:</strong> {r.tuboOxigeno || '—'} · <strong>Cuerpo médico:</strong> {r.trasladoMedico || '—'}</p>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default TablaRegistros;
