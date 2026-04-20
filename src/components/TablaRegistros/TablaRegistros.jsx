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

const getRowKey = (seccion, registro, index) =>
  [
    seccion,
    registro?.id ?? 'sin-id',
    registro?.createdAt ?? 'sin-fecha',
    registro?.rechazadoAt ?? 'sin-rechazo',
    registro?.intersedeAt ?? 'sin-intersede',
    registro?.camaReservadaAt ?? 'sin-cama',
    index,
  ].join('-');

const SECCIONES = {
  intersedes: 'intersedes',
  rechazadas: 'rechazadas',
  camas: 'camas',
};
const OPCIONES_TRASLADO_INTERSEDE = [
  { id: '', label: 'Seleccionar traslado' },
  { id: 'nueva-cordoba-a-cerro', label: 'Nueva Córdoba -> Cerro' },
  { id: 'cerro-a-nueva-cordoba', label: 'Cerro -> Nueva Córdoba' },
];

const TablaRegistros = ({
  registros,
  rechazadas = [],
  intersedes = [],
  camasReservadas = [],
  onClear,
  onDelete,
  onDerivarIntersedes,
  onReservarCama,
  onAsignarIntersede,
  onAsignarCama,
  onPrint,
}) => {
  const [expandido, setExpandido] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('hoy');
  const [seccionActiva, setSeccionActiva] = useState(SECCIONES.intersedes);
  const [draftIntersedes, setDraftIntersedes] = useState({});
  const [draftCamas, setDraftCamas] = useState({});

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
  const filtradosIntersedes = useMemo(() => {
    const soloIntersedes = (intersedes ?? []).filter((r) => Boolean(r?.intersedeAt));
    return filtrarLista(soloIntersedes);
  }, [intersedes, busqueda, filtroFecha]);
  const filtradosCamas = useMemo(() => {
    const soloCamas = (camasReservadas ?? []).filter((r) => Boolean(r?.camaReservadaAt));
    return filtrarLista(soloCamas);
  }, [camasReservadas, busqueda, filtroFecha]);
  const totalIntersedes = useMemo(
    () => (intersedes ?? []).filter((r) => Boolean(r?.intersedeAt)).length,
    [intersedes],
  );
  const totalCamas = useMemo(
    () => (camasReservadas ?? []).filter((r) => Boolean(r?.camaReservadaAt)).length,
    [camasReservadas],
  );

  const stats = useMemo(() => {
    return {
      intersedes: filtradosIntersedes.length,
      rechazadas: filtradosRechazadas.length,
      camasReservadas: filtradosCamas.length,
    };
  }, [filtradosIntersedes.length, filtradosRechazadas.length, filtradosCamas.length]);

  const renderDetalle = (r) => (
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
  );

  const getTituloSeccion = () => {
    if (seccionActiva === SECCIONES.rechazadas) return 'Rechazadas';
    if (seccionActiva === SECCIONES.camas) return 'Camas reservadas';
    return 'Intersedes';
  };

  const getListaSeccion = () => {
    if (seccionActiva === SECCIONES.rechazadas) return filtradosRechazadas;
    if (seccionActiva === SECCIONES.camas) return filtradosCamas;
    return filtradosIntersedes;
  };

  const listaActiva = getListaSeccion();

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
        <button
          type="button"
          className={`${styles.statCard} ${styles.statBlue} ${seccionActiva === SECCIONES.intersedes ? styles.statCardActiva : ''}`}
          onClick={() => setSeccionActiva(SECCIONES.intersedes)}
        >
          <p>Intersedes</p>
          <strong>{String(stats.intersedes).padStart(2, '0')}</strong>
        </button>
        <button
          type="button"
          className={`${styles.statCard} ${styles.statSlate} ${seccionActiva === SECCIONES.rechazadas ? styles.statCardActiva : ''}`}
          onClick={() => setSeccionActiva(SECCIONES.rechazadas)}
        >
          <p>Rechazadas</p>
          <strong>{String(stats.rechazadas).padStart(2, '0')}</strong>
        </button>
        <button
          type="button"
          className={`${styles.statCard} ${styles.statOrange} ${seccionActiva === SECCIONES.camas ? styles.statCardActiva : ''}`}
          onClick={() => setSeccionActiva(SECCIONES.camas)}
        >
          <p>Camas reservadas</p>
          <strong>{String(stats.camasReservadas).padStart(2, '0')}</strong>
        </button>
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
                        {onDerivarIntersedes && (
                          <button
                            type="button"
                            className={`${styles.iconBtn} ${styles.iconIntersede}`}
                            onClick={() => {
                              if (window.confirm('¿Enviar este paciente a Intersedes?')) {
                                onDerivarIntersedes(r.id);
                              }
                            }}
                            title="Derivar a Intersedes"
                          >
                            ↗
                          </button>
                        )}
                        {onReservarCama && (
                          <button
                            type="button"
                            className={`${styles.iconBtn} ${styles.iconCama}`}
                            onClick={() => {
                              if (window.confirm('¿Enviar este paciente a Camas reservadas?')) {
                                onReservarCama(r.id);
                              }
                            }}
                            title="Derivar a cama reservada"
                          >
                            🛏
                          </button>
                        )}
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
                          {renderDetalle(r)}
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
          <h3>{getTituloSeccion()}</h3>
        </div>

        {listaActiva.length === 0 ? (
          <p className={styles.vacio}>
            {seccionActiva === SECCIONES.rechazadas && 'Aún no hay derivaciones rechazadas.'}
            {seccionActiva === SECCIONES.intersedes && 'Aún no hay derivaciones en Intersedes.'}
            {seccionActiva === SECCIONES.camas && 'Aún no hay derivaciones en Camas reservadas.'}
          </p>
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
                  {seccionActiva === SECCIONES.intersedes && <th>Traslado Intersede</th>}
                  {seccionActiva === SECCIONES.camas && <th>Cama</th>}
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {listaActiva.map((r, index) => (
                  <Fragment key={getRowKey(seccionActiva, r, index)}>
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
                        {seccionActiva === SECCIONES.rechazadas && (
                          <span className={styles.badgeRechazada}>RECHAZADA</span>
                        )}
                        {seccionActiva === SECCIONES.intersedes && (
                          <span className={styles.badgeIntersedes}>INTERSEDE</span>
                        )}
                        {seccionActiva === SECCIONES.camas && (
                          <span className={styles.badgeCama}>CAMA RESERVADA</span>
                        )}
                        <p className={styles.diagText}>{r.diagnostico || '—'}</p>
                      </td>
                      {seccionActiva === SECCIONES.intersedes && (
                        <td>
                          <div className={styles.intersedeEditor}>
                            {(() => {
                              const trasladoGuardado = Boolean(r.tipoTrasladoIntersede);
                              return (
                                <>
                                  <select
                                    className={styles.selectIntersede}
                                    value={draftIntersedes[r.id] ?? r.tipoTrasladoIntersede ?? ''}
                                    onChange={(e) =>
                                      setDraftIntersedes((prev) => ({
                                        ...prev,
                                        [r.id]: e.target.value,
                                      }))
                                    }
                                    disabled={trasladoGuardado}
                                  >
                                    {OPCIONES_TRASLADO_INTERSEDE.map((opcion) => (
                                      <option key={opcion.id || 'empty'} value={opcion.id}>
                                        {opcion.label}
                                      </option>
                                    ))}
                                  </select>
                                  <button
                                    type="button"
                                    className={`${styles.btnAsignar} ${trasladoGuardado ? styles.btnDeshacer : ''}`}
                                    onClick={() => {
                                      if (trasladoGuardado) {
                                        setDraftIntersedes((prev) => ({
                                          ...prev,
                                          [r.id]: '',
                                        }));
                                        onAsignarIntersede?.(r.id, '');
                                        return;
                                      }
                                      onAsignarIntersede?.(
                                        r.id,
                                        draftIntersedes[r.id] ?? r.tipoTrasladoIntersede ?? '',
                                      );
                                    }}
                                  >
                                    {trasladoGuardado ? 'Deshacer' : 'Guardar'}
                                  </button>
                                </>
                              );
                            })()}
                          </div>
                        </td>
                      )}
                      {seccionActiva === SECCIONES.camas && (
                        <td>
                          <div className={styles.camaEditor}>
                            {(() => {
                              const camaGuardada = Boolean(r.camaAsignada);
                              return (
                                <>
                                  <input
                                    type="text"
                                    className={styles.inputCama}
                                    value={draftCamas[r.id] ?? r.camaAsignada ?? ''}
                                    onChange={(e) =>
                                      setDraftCamas((prev) => ({
                                        ...prev,
                                        [r.id]: e.target.value,
                                      }))
                                    }
                                    placeholder="Ej: Cama 14B"
                                    disabled={camaGuardada}
                                  />
                                  <button
                                    type="button"
                                    className={`${styles.btnAsignar} ${camaGuardada ? styles.btnDeshacer : ''}`}
                                    onClick={() => {
                                      if (camaGuardada) {
                                        setDraftCamas((prev) => ({
                                          ...prev,
                                          [r.id]: '',
                                        }));
                                        onAsignarCama?.(r.id, '');
                                        return;
                                      }
                                      onAsignarCama?.(r.id, draftCamas[r.id] ?? r.camaAsignada ?? '');
                                    }}
                                  >
                                    {camaGuardada ? 'Deshacer' : 'Guardar'}
                                  </button>
                                </>
                              );
                            })()}
                          </div>
                        </td>
                      )}
                      <td className={styles.celdasAcciones}>
                        <button
                          type="button"
                          className={styles.iconBtn}
                          onClick={() =>
                            setExpandido(expandido === `${seccionActiva}-${r.id}` ? null : `${seccionActiva}-${r.id}`)
                          }
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
                    {expandido === `${seccionActiva}-${r.id}` && (
                      <tr className={styles.filaDetalle}>
                        <td colSpan={seccionActiva === SECCIONES.camas || seccionActiva === SECCIONES.intersedes ? 8 : 7}>
                          {renderDetalle(r)}
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
          {seccionActiva === SECCIONES.rechazadas &&
            `Mostrando ${filtradosRechazadas.length} de ${rechazadas.length} rechazadas`}
          {seccionActiva === SECCIONES.intersedes &&
            `Mostrando ${filtradosIntersedes.length} de ${totalIntersedes} intersedes`}
          {seccionActiva === SECCIONES.camas &&
            `Mostrando ${filtradosCamas.length} de ${totalCamas} camas reservadas`}
        </footer>
      </section>
    </section>
  );
};

export default TablaRegistros;
