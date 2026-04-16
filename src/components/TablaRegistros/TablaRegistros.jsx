import { useState, Fragment, useMemo } from 'react';
import styles from './TablaRegistros.module.css';

const FILTROS_FECHA = [
  { id: 'hoy', label: 'Hoy' },
  { id: '7d', label: 'Últimos 7 días' },
  { id: '30d', label: 'Últimos 30 días' },
  { id: 'todo', label: 'Todo' },
];

const formatFecha = (iso) => {
  try {
    return new Date(iso).toLocaleString('es-AR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
};

const formatHora = (iso) => {
  try {
    return new Date(iso).toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
};

const getEstado = (r) => {
  const d = (r.diagnostico ?? '').toLowerCase();
  if (/urg|agudo/.test(d)) return 'urgente';
  return 'activo';
};

const TablaRegistros = ({ registros, rechazadas = [], onClear, onDelete, onPrint }) => {
  const [expandido, setExpandido] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('hoy');

  const filtrarLista = (lista) => {
    if (!lista?.length) return [];
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

    return [...lista]
      .filter((r) => matchesTexto(r) && matchesFecha(r))
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  };

  const filtrados = useMemo(() => filtrarLista(registros), [registros, busqueda, filtroFecha]);
  const filtradosRechazadas = useMemo(
    () => filtrarLista(rechazadas),
    [rechazadas, busqueda, filtroFecha],
  );

  const stats = useMemo(() => {
    const intersedes = filtrados.filter((r) => (r.cedeRecibe ?? '').trim()).length;
    const totalRechazadas = filtradosRechazadas.length;
    const camasReservadas = filtrados.filter(
      (r) => r.trasladoMedico === 'si' || r.tuboOxigeno === 'si',
    ).length;
    return { intersedes, rechazadas: totalRechazadas, camasReservadas };
  }, [filtrados, filtradosRechazadas]);

  return (
    <section className={styles.wrapper}>
      <header className={styles.top}>
        <div>
          <h2 className={styles.titulo}>Derivaciones</h2>
          <p className={styles.subtitulo}>Gestión centralizada de traslados y derivaciones clínicas.</p>
        </div>
        <div className={styles.filtrosFecha}>
          {FILTROS_FECHA.map((f) => (
            <button
              key={f.id}
              type="button"
              className={filtroFecha === f.id ? styles.filtroFechaActivo : styles.filtroFecha}
              onClick={() => setFiltroFecha(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </header>

      <div className={styles.stats}>
        <article className={`${styles.statCard} ${styles.statBlue}`}>
          <p>Intersedes</p>
          <strong>{String(stats.intersedes).padStart(2, '0')}</strong>
        </article>
        <article className={`${styles.statCard} ${styles.statSlate}`}>
          <p>Rechazadas</p>
          <strong>{String(stats.rechazadas).padStart(2, '0')}</strong>
        </article>
        <article className={`${styles.statCard} ${styles.statOrange}`}>
          <p>Camas reservadas</p>
          <strong>{String(stats.camasReservadas).padStart(2, '0')}</strong>
        </article>
      </div>

      <section className={styles.listCard}>
        <div className={styles.listHeader}>
          <h3>Listado de pacientes</h3>
          <div className={styles.listActions}>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar paciente o derivación..."
              className={styles.inputBusqueda}
            />
            {onClear && (
              <button type="button" onClick={onClear} className={styles.btnClear}>
                Vaciar tabla
              </button>
            )}
          </div>
        </div>

        {filtrados.length === 0 ? (
          <p className={styles.vacio}>No hay derivaciones para ese filtro.</p>
        ) : (
          <div className={styles.scroll}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Apellido y nombres</th>
                  <th>Documento</th>
                  <th>Edad</th>
                  <th>Obra social</th>
                  <th>Diagnóstico</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((r) => (
                  <Fragment key={r.id}>
                    <tr>
                      <td>
                        <div className={styles.fechaCell}>
                          <span>{formatFecha(r.createdAt)}</span>
                          <small>{formatHora(r.createdAt)}</small>
                        </div>
                      </td>
                      <td className={styles.nombre}>{r.apellidoNombres || '—'}</td>
                      <td>{r.documento || '—'}</td>
                      <td>{r.edad ? `${r.edad} años` : '—'}</td>
                      <td>{r.obraSocial || '—'}</td>
                      <td>
                        <span className={getEstado(r) === 'urgente' ? styles.badgeUrgente : styles.badgeActivo}>
                          {getEstado(r) === 'urgente' ? 'URGENTE' : 'ACTIVO'}
                        </span>
                        <p className={styles.diagText}>{r.diagnostico || '—'}</p>
                      </td>
                      <td className={styles.celdasAcciones}>
                        <button
                          type="button"
                          className={styles.iconBtn}
                          onClick={() => setExpandido(expandido === r.id ? null : r.id)}
                          title="Ver más"
                        >
                          👁
                        </button>
                        <button
                          type="button"
                          className={styles.iconBtn}
                          onClick={() => onPrint?.(r)}
                          title="Imprimir derivación"
                        >
                          🖨
                        </button>
                        {onDelete && (
                          <button
                            type="button"
                            className={`${styles.iconBtn} ${styles.iconDelete}`}
                            onClick={() => {
                              if (window.confirm('¿Mover este registro a Rechazadas?')) onDelete(r.id);
                            }}
                            title="Eliminar registro"
                          >
                            🗑
                          </button>
                        )}
                      </td>
                    </tr>
                    {expandido === r.id && (
                      <tr className={styles.filaDetalle}>
                        <td colSpan={7}>
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
        )}

        <footer className={styles.footerList}>
          Mostrando {filtrados.length} de {registros.length} derivaciones
        </footer>
      </section>

      <section className={styles.listCard}>
        <div className={styles.listHeader}>
          <h3>Rechazadas</h3>
        </div>

        {filtradosRechazadas.length === 0 ? (
          <p className={styles.vacio}>Aún no hay derivaciones rechazadas.</p>
        ) : (
          <div className={styles.scroll}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Apellido y nombres</th>
                  <th>Documento</th>
                  <th>Edad</th>
                  <th>Obra social</th>
                  <th>Diagnóstico</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtradosRechazadas.map((r) => (
                  <Fragment key={`rechazada-${r.id}`}>
                    <tr>
                      <td>
                        <div className={styles.fechaCell}>
                          <span>{formatFecha(r.createdAt)}</span>
                          <small>{formatHora(r.createdAt)}</small>
                        </div>
                      </td>
                      <td className={styles.nombre}>{r.apellidoNombres || '—'}</td>
                      <td>{r.documento || '—'}</td>
                      <td>{r.edad ? `${r.edad} años` : '—'}</td>
                      <td>{r.obraSocial || '—'}</td>
                      <td>
                        <span className={styles.badgeRechazada}>RECHAZADA</span>
                        <p className={styles.diagText}>{r.diagnostico || '—'}</p>
                      </td>
                      <td className={styles.celdasAcciones}>
                        <button
                          type="button"
                          className={styles.iconBtn}
                          onClick={() => setExpandido(expandido === `rechazada-${r.id}` ? null : `rechazada-${r.id}`)}
                          title="Ver más"
                        >
                          👁
                        </button>
                        <button
                          type="button"
                          className={styles.iconBtn}
                          onClick={() => onPrint?.(r)}
                          title="Imprimir derivación"
                        >
                          🖨
                        </button>
                      </td>
                    </tr>
                    {expandido === `rechazada-${r.id}` && (
                      <tr className={styles.filaDetalle}>
                        <td colSpan={7}>
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
        )}

        <footer className={styles.footerList}>
          Mostrando {filtradosRechazadas.length} de {rechazadas.length} rechazadas
        </footer>
      </section>
    </section>
  );
};

export default TablaRegistros;
