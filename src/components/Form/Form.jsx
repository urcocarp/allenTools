import styles from './Form.module.css';
import { useRef } from 'react';
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

const Form = ({ onGuardar }) => {
  const formRef = useRef(null);
  const timestampRef = useRef(null);

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
      const data = getFormData(form);
      if (data?.apellidoNombres) {
        const registro = {
          id: crypto.randomUUID(),
          ...data,
          createdAt: new Date().toISOString(),
        };
        onGuardar?.(registro);
      }
      form.reset();
    }, 500);
  };

  return (
    <form className={styles.form} ref={formRef}>
      <div className={styles.header}>
        <div className={styles.empresa}>
          <img src={logo} alt="Sanatorio Allende" />
        </div>
        <div>
          <p className={styles.titulo}>DERIVACIONES SANATORIO ALLENDE</p>
          <p className={styles.timestamp} ref={timestampRef} />
        </div>
      </div>
      <div className={styles.emer}>
        <p>SUP ENF: 60700/3175</p>
        <p>UTI: 3125</p>
        <p>UCO: 3178/3179</p>
      </div>

      <input type="text" name="apellidoNombres" placeholder="Apellido y nombres" />
      <input type="text" name="documento" placeholder="Documento" />
      <input type="text" name="lugar" placeholder="Lugar de donde proviene" />
      <input type="text" name="edad" placeholder="Edad" />
      <input type="text" name="telefono" placeholder="Teléfono" />
      <input type="text" name="obraSocial" placeholder="Obra social" />
      <input type="text" name="plan" placeholder="Plan" />
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

      <div className={styles.vitales}>
        <div className={styles.fila}>
          <label>Frecuencia cardiaca</label>
          <input type="text" name="fc" />
        </div>
        <div className={styles.fila}>
          <label>Frecuencia respiratoria</label>
          <input type="text" name="fr" />
        </div>
        <div className={styles.fila}>
          <label>Glasgow</label>
          <input type="text" name="glasgow" />
        </div>
        <div className={styles.fila}>
          <label>SAT</label>
          <input type="text" name="sat" />
        </div>
        <div className={styles.fila}>
          <label>TA</label>
          <input type="text" name="ta" />
        </div>
        <div className={styles.fila}>
          <label>Temperatura</label>
          <input type="text" name="temperatura" />
        </div>
        <div className={styles.filaBoolean}>
          <label>¿se traslada con tubo de oxígeno?</label>
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

      <button type="button" onClick={handlePrint} className={styles.btnPrint}>
        Imprimir
      </button>
    </form>
  );
};

export default Form;
