import styles from './Form.module.css';
import { useRef } from 'react';
import logo from '../../assets/allende.jpg';

const Form = () => {
  const formRef = useRef(null);

  const handlePrint = () => {
    const form = formRef.current;
    if (!form) return;

    form.querySelectorAll('input, textarea').forEach((el) => {
      if (!el.value.trim()) {
        el.classList.add(styles['print-hide']);
      }
    });

    form.querySelectorAll(`.${styles.fila}`).forEach((fila) => {
      const inputs = fila.querySelectorAll('input, textarea');
      const hasValue = [...inputs].some((i) => i.value.trim());
      if (!hasValue) {
        fila.classList.add(styles['print-hide']);
      }
    });

    form.querySelectorAll(`.${styles.vitales}`).forEach((bloque) => {
      const inputs = bloque.querySelectorAll('input, textarea');
      const hasValue = [...inputs].some((i) => i.value.trim());
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
      form.reset();
    }, 500);
  };

  return (
    <form className={styles.form} ref={formRef}>
      <div className={styles.header}>
        <div className={styles.empresa}>
          <img src={logo} alt="Sanatorio Allende" />
        </div>
        <p className={styles.titulo}>DERIVACIONES SANATORIO ALLENDE</p>
      </div>
      <div className={styles.emer}>
        <p>SUP ENF: 60700/3175</p>
        <p>UTI: 3125</p>
        <p>UCO: 3178/3179</p>
      </div>

      <input type="text" placeholder="Apellido y nombres" />
      <input type="text" placeholder="Documento" />
      <input type="text" placeholder="Lugar de donde proviene" />
      <input type="text" placeholder="Edad" />
      <input type="text" placeholder="Teléfono" />
      <input type="text" placeholder="Obra social" />
      <input type="text" placeholder="Plan" />
      <input type="text" placeholder="Diagnóstico" />

      <div className={styles.fila}>
        <label>¿Es politraumatismo?</label>
        <input type="text" placeholder="¿Por qué?" />
      </div>

      <div className={styles.observaciones}>
        <label>Observaciones</label>
        <textarea
          placeholder="Escriba aquí las observaciones del paciente..."
          rows={4}
        />
      </div>

      <div className={styles.vitales}>
        <div className={styles.fila}>
          <label>Frecuencia cardiaca</label>
          <input type="text" />
        </div>
        <div className={styles.fila}>
          <label>Frecuencia respiratoria</label>
          <input type="text" />
        </div>
        <div className={styles.fila}>
          <label>Glasgow</label>
          <input type="text" />
        </div>
        <div className={styles.fila}>
          <label>SAT</label>
          <input type="text" />
        </div>
        <div className={styles.fila}>
          <label>TA</label>
          <input type="text" />
        </div>
        <div className={styles.fila}>
          <label>Temperatura</label>
          <input type="text" />
        </div>
      </div>

      <button type="button" onClick={handlePrint} className={styles.btnPrint}>
        Imprimir
      </button>
    </form>
  );
};

export default Form;
