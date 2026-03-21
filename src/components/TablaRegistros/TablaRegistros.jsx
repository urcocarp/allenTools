import { useState, Fragment, useMemo } from 'react';
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

const FILTROS_FECHA = [
  { id: 'hoy', label: 'Hoy' },
  { id: '7d', label: 'Últimos 7 días' },
  { id: '30d', label: 'Últimos 30 días' },
  { id: 'todo', label: 'Todo' },
];

const TablaRegistros = ({ registros, onClear, onDelete, onPrint }) => {
  const [expandido, setExpandido] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('7d');

  const filtrados = useMemo(() => {
    if (!registros?.length) return [];
    const ahora = new Date();

    const matchesTexto = (r) => {
      if (!busqueda.trim()) return true;
      const q = busqueda.trim().toLowerCase();
      return (
        (r.apellidoNombres ?? '').toLowerCase().includes(q) ||
        (r.documento ?? '').toLowerCase().includes(q)
      );
    };

    const matchesFecha = (r) => {
      if (filtroFecha === 'todo') return true;
      if (!r.createdAt) return false;
      const fecha = new Date(r.createdAt);
      if (Number.isNaN(fecha.getTime())) return false;

      if (filtroFecha === 'hoy') {
        const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
        const f = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
        return f.getTime() === hoy.getTime();
      }

      const dias = filtroFecha === '7d' ? 7 : 30;
      const limite = new Date(ahora);
      limite.setDate(limite.getDate() - dias);
      return fecha >= limite;
    };

    return [...registros]
      .filter((r) => matchesTexto(r) && matchesFecha(r))
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [registros, busqueda, filtroFecha]);

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
        <div className={styles.headerMain}>
          <h2 className={styles.titulo}>Derivaciones</h2>
          <p className={styles.subtitulo}>
            {filtrados.length} registro{filtrados.length === 1 ? '' : 's'} en el rango seleccionado
          </p>
        </div>
        <div className={styles.controles}>
          <div className={styles.busquedaBox}>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por apellido o documento..."
              className={styles.inputBusqueda}
            />
          </div>
          <div className={styles.filtrosFecha}>
            {FILTROS_FECHA.map((f) => (
              <button
                key={f.id}
                type="button"
                className={
                  filtroFecha === f.id ? styles.filtroFechaActivo : styles.filtroFecha
                }
                onClick={() => setFiltroFecha(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
          {onClear && (
            <button type="button" onClick={onClear} className={styles.btnClear}>
              Vaciar tabla
            </button>
          )}
        </div>
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
            {filtrados.map((r) => (
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
                    <button
                      type="button"
                      className={styles.btnImprimir}
                      onClick={() => onPrint?.(r)}
                      title="Imprimir derivación"
                    >
                      Imprimir
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
                        <p><strong>Profesional que recibe:</strong> {r.profesionalRecibe || '—'}</p>
                        <p><strong>Cede que se recibe:</strong> {r.cedeRecibe || '—'}</p>
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
