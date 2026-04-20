import styles from './Form.module.css';
import { useRef, useEffect } from 'react';
import logo from '../../assets/allende.jpg';

const getFormData = (form) => {
  if (!form) return null;
  const fd = new FormData(form);
  const get = (k) => (fd.get(k) ?? '').toString().trim();
  const getRadio = (name) => form.querySelector(`input[name="${name}"]:checked`)?.value ?? '';
  return {
    apellidoNombres: get('apellidoNombres'),
    documento: get('documento'),
    lugar: get('lugar'),
    edad: get('edad'),
    telefono: get('telefono'),
    obraSocial: get('obraSocial'),
    plan: get('plan'),
    diagnostico: get('diagnostico'),
    politraumatismo: get('politraumatismo'),
    profesionalRecibe: get('profesionalRecibe'),
    cedeRecibe: get('cedeRecibe'),
    observaciones: get('observaciones'),
    fc: get('fc'),
    fr: get('fr'),
    glasgow: get('glasgow'),
    sat: get('sat'),
    ta: get('ta'),
    temperatura: get('temperatura'),
    tuboOxigeno: getRadio('tuboOxigeno'),
    trasladoMedico: getRadio('trasladoMedico'),
  };
};

const Form = ({ onGuardar, registroParaImprimir, modoReimpresion = false, onImpresionCompleta }) => {
  const formRef = useRef(null);
  const timestampRef = useRef(null);
  const printTimestampRef = useRef(null);
  const yaImprimioRef = useRef(false);

  const handlePrint = () => {
    const form = formRef.current;
    if (!form) return;

    const now = new Date().toLocaleString('es-AR', {
      dateStyle: 'short',
      timeStyle: 'short',
    });

    if (timestampRef.current) {
      timestampRef.current.textContent = `Fecha y hora de impresión: ${now}`;
    }
    if (printTimestampRef.current) {
      printTimestampRef.current.textContent = `Fecha y hora de impresión: ${now}`;
    }

    form.querySelectorAll('input, textarea').forEach((el) => {
      const type = el.getAttribute('type');
      if (type === 'checkbox' || type === 'radio') return;
      if (!el.value.trim()) {
        el.classList.add(styles['print-hide']);
      }
    });

    form.querySelectorAll(`.${styles.fila}`).forEach((fila) => {
      const inputs = fila.querySelectorAll('input, textarea');
      const hasValue = [...inputs].some((i) => {
        const type = i.getAttribute('type');
        if (type === 'checkbox' || type === 'radio') {
          return i.checked;
        }
        return i.value.trim();
      });
      if (!hasValue) {
        fila.classList.add(styles['print-hide']);
      }
    });

    form.querySelectorAll(`.${styles.vitales}`).forEach((bloque) => {
      const inputs = bloque.querySelectorAll('input, textarea');
      const hasValue = [...inputs].some((i) => {
        const type = i.getAttribute('type');
        if (type === 'checkbox' || type === 'radio') {
          return i.checked;
        }
        return i.value.trim();
      });
      if (!hasValue) {
        bloque.classList.add(styles['print-hide']);
      }
    });

    form.querySelectorAll(`.${styles.observaciones}`).forEach((obs) => {
      const textarea = obs.querySelector('textarea');
      if (!textarea?.value.trim()) {
        obs.classList.add(styles['print-hide']);
      }
    });

    window.print();

    setTimeout(() => {
      form
        .querySelectorAll(`.${styles['print-hide']}`)
        .forEach((el) => el.classList.remove(styles['print-hide']));
      if (!modoReimpresion) {
        const data = getFormData(form);
        if (data?.apellidoNombres) {
          const registro = {
            id: crypto.randomUUID(),
            ...data,
            createdAt: new Date().toISOString(),
          };
          onGuardar?.(registro);
        }
      }
      form.reset();
      if (modoReimpresion && onImpresionCompleta) {
        onImpresionCompleta();
      }
    }, 500);
  };

  // Rellenar e imprimir automáticamente cuando viene desde la tabla (reimpresión)
  useEffect(() => {
    if (!registroParaImprimir || yaImprimioRef.current) return;
    const form = formRef.current;
    if (!form) return;

    const setValue = (name, value) => {
      if (value == null) return;
      const el = form.elements.namedItem(name);
      if (!el) return;
      if (el instanceof RadioNodeList || Array.isArray(el)) {
        const radios = form.querySelectorAll(`input[name="${name}"]`);
        radios.forEach((r) => {
          // eslint-disable-next-line no-param-reassign
          r.checked = r.value === String(value);
        });
      } else {
        el.value = String(value);
      }
    };

    setValue('apellidoNombres', registroParaImprimir.apellidoNombres);
    setValue('documento', registroParaImprimir.documento);
    setValue('lugar', registroParaImprimir.lugar);
    setValue('edad', registroParaImprimir.edad);
    setValue('telefono', registroParaImprimir.telefono);
    setValue('obraSocial', registroParaImprimir.obraSocial);
    setValue('plan', registroParaImprimir.plan);
    setValue('diagnostico', registroParaImprimir.diagnostico);
    setValue('politraumatismo', registroParaImprimir.politraumatismo);
    setValue('profesionalRecibe', registroParaImprimir.profesionalRecibe);
    setValue('cedeRecibe', registroParaImprimir.cedeRecibe);
    setValue('observaciones', registroParaImprimir.observaciones);
    setValue('fc', registroParaImprimir.fc);
    setValue('fr', registroParaImprimir.fr);
    setValue('glasgow', registroParaImprimir.glasgow);
    setValue('sat', registroParaImprimir.sat);
    setValue('ta', registroParaImprimir.ta);
    setValue('temperatura', registroParaImprimir.temperatura);
    setValue('tuboOxigeno', registroParaImprimir.tuboOxigeno);
    setValue('trasladoMedico', registroParaImprimir.trasladoMedico);

    yaImprimioRef.current = true;
    handlePrint();
  }, [registroParaImprimir]);

  return (
    <form className={styles.form} ref={formRef}>
      <div className={styles.pageHeader}>
        <div>
          <p className={styles.kicker}>Formulario de gestión</p>
          <h2 className={styles.pageTitle}>Nueva Derivación Médica</h2>
          <p className={styles.pageText}>
            Completá el formulario para formalizar el proceso de derivación.
          </p>
        </div>
        <div className={styles.headerBrand}>
          <img src={logo} alt="Sanatorio Allende" />
          <p className={styles.timestamp} ref={timestampRef} />
        </div>
      </div>
      <p className={styles.printTimestamp} ref={printTimestampRef} />

      <div className={styles.layout}>
        <section className={styles.leftCol}>
          <article className={styles.card}>
            <h3 className={styles.cardTitle}>Información del Paciente</h3>
            <div className={styles.grid2}>
              <input type="text" name="apellidoNombres" placeholder="Apellido y nombres" />
              <input type="text" name="documento" placeholder="Documento" />
              <input type="text" name="edad" placeholder="Edad" />
              <input type="text" name="telefono" placeholder="Teléfono" />
            </div>
          </article>

          <article className={styles.card}>
            <h3 className={styles.cardTitle}>Cobertura</h3>
            <div className={styles.grid2}>
              <input type="text" name="obraSocial" placeholder="Obra social" />
              <input type="text" name="plan" placeholder="Plan" />
            </div>
          </article>

          <article className={styles.card}>
            <h3 className={styles.cardTitle}>Origen y Diagnóstico</h3>
            <input type="text" name="lugar" placeholder="Lugar de donde proviene" />
            <input type="text" name="diagnostico" placeholder="Diagnóstico" />
            <div className={styles.fila}>
              <label>¿Es politraumatismo?</label>
              <input type="text" name="politraumatismo" placeholder="¿Por qué?" />
            </div>
            <div className={styles.observaciones}>
              <label>Observaciones</label>
              <textarea
                name="observaciones"
                placeholder="Escriba aquí las observaciones del paciente..."
                rows={4}
              />
            </div>
          </article>

          <article className={`${styles.card} ${styles.vitales}`}>
            <h3 className={styles.cardTitle}>Signos Vitales y Traslado</h3>
            <div className={styles.grid6}>
              <div className={styles.vitalItem}>
                <label>FC</label>
                <input type="text" name="fc" />
              </div>
              <div className={styles.vitalItem}>
                <label>FR</label>
                <input type="text" name="fr" />
              </div>
              <div className={styles.vitalItem}>
                <label>Glasgow</label>
                <input type="text" name="glasgow" />
              </div>
              <div className={styles.vitalItem}>
                <label>SAT</label>
                <input type="text" name="sat" />
              </div>
              <div className={styles.vitalItem}>
                <label>TA</label>
                <input type="text" name="ta" />
              </div>
              <div className={styles.vitalItem}>
                <label>Temperatura</label>
                <input type="text" name="temperatura" />
              </div>
            </div>

            <div className={styles.row2}>
              <div className={styles.filaBoolean}>
                <label>¿Se traslada con tubo de oxígeno?</label>
                <div className={styles.booleanGroup}>
                  <label className={styles.booleanOption}>
                    <input type="radio" name="tuboOxigeno" value="si" />
                    Sí
                  </label>
                  <label className={styles.booleanOption}>
                    <input type="radio" name="tuboOxigeno" value="no" />
                    No
                  </label>
                </div>
              </div>
              <div className={styles.filaBoolean}>
                <label>¿Se traslada con cuerpo médico?</label>
                <div className={styles.booleanGroup}>
                  <label className={styles.booleanOption}>
                    <input type="radio" name="trasladoMedico" value="si" />
                    Sí
                  </label>
                  <label className={styles.booleanOption}>
                    <input type="radio" name="trasladoMedico" value="no" />
                    No
                  </label>
                </div>
              </div>
            </div>
          </article>
        </section>

        <aside className={styles.rightCol}>
          <article className={styles.actionCard}>
            <h3>Confirmar Acción</h3>
            <p>Al imprimir esta derivación se guarda automáticamente en el dashboard.</p>
            <div className={styles.filaRecibe}>
              <div className={styles.fila}>
                <label>Profesional que recibe</label>
                <input
                  type="text"
                  name="profesionalRecibe"
                />
              </div>
              <div className={styles.fila}>
                <label>Cede que se recibe</label>
                <input
                  type="text"
                  name="cedeRecibe"
                />
              </div>
            </div>
            <button type="button" onClick={handlePrint} className={styles.btnPrint}>
              Imprimir Derivación
            </button>
          </article>
        </aside>
      </div>
    </form>
  );
};

export default Form;
