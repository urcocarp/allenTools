import { useEffect, useRef } from 'react';
import styles from './LearningHub.module.css';

const scrollToCostosSection = (e) => {
  const onHub = window.location.hash.replace('#', '') === 'learninghub';
  if (onHub) {
    e.preventDefault();
    document.getElementById('costos')?.scrollIntoView({ behavior: 'smooth' });
    return;
  }
  window.setTimeout(() => {
    document.getElementById('costos')?.scrollIntoView({ behavior: 'smooth' });
  }, 320);
};

const LearningHub = () => {
  const hubRef = useRef(null);

  useEffect(() => {
    let rafId = null;
    const getScrollParent = (node) => {
      let el = node?.parentElement;
      while (el && el !== document.body) {
        const { overflowY } = window.getComputedStyle(el);
        if (overflowY === 'auto' || overflowY === 'scroll') return el;
        el = el.parentElement;
      }
      return null;
    };

    const updateParallaxLayers = () => {
      const hub = hubRef.current;
      if (!hub) {
        rafId = null;
        return;
      }
      const wraps = hub.querySelectorAll('[data-parallax-wrap]');
      const scrollRoot = getScrollParent(hub);
      const vh = scrollRoot
        ? scrollRoot.clientHeight
        : window.innerHeight || document.documentElement.clientHeight || 800;

      wraps.forEach((root) => {
        const layer = root.querySelector('[data-parallax-layer]');
        if (!layer) return;
        const rect = root.getBoundingClientRect();
        const blockCenter = (rect.top + rect.bottom) / 2;
        const viewportCenter = scrollRoot
          ? scrollRoot.getBoundingClientRect().top + scrollRoot.clientHeight / 2
          : vh / 2;
        const distance = viewportCenter - blockCenter;
        const offsetY = Math.max(-200, Math.min(200, distance * 0.48));
        const scale = 1.06 + (Math.abs(distance) / Math.max(vh, 380)) * 0.22;
        layer.style.transform = `translate3d(0, ${offsetY}px, 0) scale(${scale})`;
      });
      rafId = null;
    };

    const onScroll = () => {
      if (rafId != null) return;
      rafId = window.requestAnimationFrame(updateParallaxLayers);
    };

    const hub = hubRef.current;
    const scrollRoot = hub ? getScrollParent(hub) : null;

    updateParallaxLayers();
    const targets = scrollRoot ? [scrollRoot] : [window];
    targets.forEach((t) => t.addEventListener('scroll', onScroll, { passive: true }));
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      if (rafId != null) window.cancelAnimationFrame(rafId);
      targets.forEach((t) => t.removeEventListener('scroll', onScroll));
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <div ref={hubRef} className={styles.hub}>
      <header className={styles.topBar}>
        <p className={styles.brandName}>The Clinical Atelier</p>
        <div className={styles.avatar} aria-hidden />
      </header>

      <section data-parallax-wrap className={`${styles.hero} ${styles.heroSlide}`}>
        <div data-parallax-layer className={styles.heroParallaxLayer} aria-hidden />
        <div className={styles.heroInner}>
          <span className={styles.modulePill}>Módulo de capacitación</span>
          <h1 className={styles.heroTitle}>Protocolo de derivación</h1>
          <p className={styles.heroLead}>
            A la hora de tomar una derivación, estos pasos ordenan la información clínica y administrativa
            antes de confirmar el ingreso.
          </p>
        </div>
      </section>

      {/* Paso 1 — parallax */}
      <section data-parallax-wrap className={`${styles.parallaxWrap} ${styles.parallaxSlide}`}>
        <div
          data-parallax-layer
          className={`${styles.parallaxBg} ${styles.parallaxBgA}`}
          aria-hidden
        />
        <div className={styles.parallaxFg}>
          <div className={styles.stepRibbon}>
            <span className={styles.stepRibbonNum}>1</span>
            <span className={styles.stepRibbonLabel}>Paso uno</span>
          </div>
          <article className={styles.stepCard}>
            <h3 className={styles.stepCardTitle}>Tranquilidad y atención</h3>
            <p>
              Tratá de estar lo más tranquilo posible y de prestar la mayor atención: por teléfono debemos
              captar la mayor cantidad de información del paciente para transmitirla con claridad a nuestro
              equipo médico.
            </p>
          </article>
        </div>
      </section>

      {/* Paso 2 — parallax */}
      <section data-parallax-wrap className={`${styles.parallaxWrap} ${styles.parallaxSlide}`}>
        <div
          data-parallax-layer
          className={`${styles.parallaxBg} ${styles.parallaxBgB}`}
          aria-hidden
        />
        <div className={styles.parallaxFg}>
          <div className={styles.stepRibbon}>
            <span className={styles.stepRibbonNum}>2</span>
            <span className={styles.stepRibbonLabel}>Paso dos</span>
          </div>
          <article className={`${styles.stepCard} ${styles.stepCardMuted}`}>
            <h3 className={styles.stepCardTitle}>Completar el formulario</h3>
            <p>
              Completamos el formulario <strong>paso a paso</strong>, sin apurar ni saltear datos: cada
              campo ayuda a que la derivación llegue completa a quien debe recibir al paciente.
            </p>
          </article>
        </div>
      </section>

      {/* Paso 3 — parallax */}
      <section data-parallax-wrap className={`${styles.parallaxWrap} ${styles.parallaxSlide}`}>
        <div
          data-parallax-layer
          className={`${styles.parallaxBg} ${styles.parallaxBgC}`}
          aria-hidden
        />
        <div className={styles.parallaxFg}>
          <div className={styles.stepRibbon}>
            <span className={styles.stepRibbonNum}>3</span>
            <span className={styles.stepRibbonLabel}>Paso tres</span>
          </div>
          <article className={styles.stepCard}>
            <h3 className={styles.stepCardTitle}>Antes de confirmar la derivación</h3>
            <p>
              Verificá si hay disponibilidad de <strong>cama</strong>, <strong>UTI</strong>,{' '}
              <strong>UCO</strong> y <strong>piso</strong>. Si el paciente es{' '}
              <strong>pediátrico</strong>, avisá también en <strong>piso</strong> y en{' '}
              <strong>UTI pediátrica</strong>.
            </p>
            <div className={styles.availGrid}>
              <div className={styles.availCell}>
                <span className={styles.availIcon} aria-hidden>
                  🛏
                </span>
                Cama
              </div>
              <div className={styles.availCell}>
                <span className={styles.availIcon} aria-hidden>
                  ⚡
                </span>
                UTI
              </div>
              <div className={styles.availCell}>
                <span className={styles.availIcon} aria-hidden>
                  ♥
                </span>
                UCO
              </div>
              <div className={styles.availCell}>
                <span className={styles.availIcon} aria-hidden>
                  🏢
                </span>
                Piso
              </div>
            </div>
            <div className={styles.alertBox}>
              <p className={styles.alertTitle}>
                <span aria-hidden>⚠</span>
                Pediátrico
              </p>
              <p>
                Coordiná con <strong>piso</strong> y <strong>UTI pediátrica</strong> antes de cerrar la
                derivación.
              </p>
            </div>
            <div className={styles.calloutCobertura}>
              <strong>Siempre</strong> consultá qué <strong>cobertura médica</strong> tiene el paciente,
              aunque la llamada vaya rápido: es el dato que condiciona el circuito administrativo y clínico.
            </div>
          </article>
        </div>
      </section>

      {/* Particular / montos — parallax + id costos */}
      <section id="costos" data-parallax-wrap className={`${styles.parallaxWrap} ${styles.parallaxSlide}`}>
        <div
          data-parallax-layer
          className={`${styles.parallaxBg} ${styles.parallaxBgD}`}
          aria-hidden
        />
        <div className={styles.parallaxFg}>
          <div className={styles.stepRibbon}>
            <span className={styles.stepRibbonNum}>4</span>
            <span className={styles.stepRibbonLabel}>Paciente particular</span>
          </div>
          <article className={styles.stepCard}>
            <h3 className={styles.stepCardTitle}>Informar montos y condiciones</h3>
            <p>
              Si es <strong>particular</strong>, informá los montos de internación para que el médico de
              guardia pueda valorar el criterio de internación. Primero aclarar el{' '}
              <strong>costo de la consulta</strong>: <strong>consulta, estudios y medicación van aparte</strong>
              .
            </p>
            <div className={styles.costHero}>
              <div className={styles.costHeroLeft}>
                <h4>Cama fría</h4>
                <small>Firma de documentación</small>
              </div>
              <div className={styles.costPrice}>$ 1.000.000</div>
              <div className={styles.costFoot}>
                <span aria-hidden>📋</span>
                <span>
                  Se comunica que, al finalizar la atención, el departamento de facturación se pondrá en
                  contacto con el paciente en un lapso de <strong>72 horas</strong>.
                </span>
              </div>
            </div>
            <p className={styles.priceListIntro}>Referencias de internación (valores orientativos):</p>
            <div className={styles.pricingGrid}>
              <div className={styles.priceCard}>
                <div className={styles.priceCardLabel}>Piso</div>
                <div className={styles.priceCardValue}>$ 7.500.000</div>
              </div>
              <div className={styles.priceCard}>
                <div className={styles.priceCardLabel}>UTI</div>
                <div className={styles.priceCardValue}>$ 10.500.000</div>
              </div>
              <div className={styles.priceCard}>
                <div className={styles.priceCardLabel}>UCO</div>
                <div className={styles.priceCardValue}>$ 10.500.000</div>
              </div>
              <div className={`${styles.priceCard} ${styles.priceCardHighlight}`}>
                <div className={styles.priceCardLabel}>Cirugía inmediata</div>
                <div className={styles.priceCardValue}>$ 14.500.000</div>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* Cobertura — parallax */}
      <section data-parallax-wrap className={`${styles.parallaxWrap} ${styles.parallaxSlide}`}>
        <div
          data-parallax-layer
          className={`${styles.parallaxBg} ${styles.parallaxBgE}`}
          aria-hidden
        />
        <div className={styles.parallaxFg}>
          <div className={styles.stepRibbon}>
            <span className={styles.stepRibbonNum}>5</span>
            <span className={styles.stepRibbonLabel}>Con cobertura médica</span>
          </div>
          <article className={`${styles.stepCard} ${styles.stepCardMuted}`}>
            <h3 className={styles.stepCardTitle}>Validar la cobertura</h3>
            <p>
              Debemos asegurarnos de que el paciente tenga la cobertura que informa quien deriva: consultá
              nuestro <strong>padrón</strong> y, si corresponde, los <strong>validadores online</strong>{' '}
              disponibles.
            </p>
            <div className={styles.coverageBox}>
              <div className={styles.coverageRow}>
                <div className={styles.coverageIcon} aria-hidden>
                  🔍
                </div>
                <div>
                  <h5>Registro de pacientes</h5>
                  <p>Búsqueda en base central y antecedentes de admisión.</p>
                </div>
              </div>
              <div className={styles.coverageRow}>
                <div className={styles.coverageIcon} aria-hidden>
                  🌐
                </div>
                <div>
                  <h5>Validadores online</h5>
                  <p>Portales y validaciones según obra social (OSDE, Galeno, Swiss Medical, etc.).</p>
                </div>
              </div>
              <button type="button" className={styles.btnMaster}>
                <span aria-hidden>✓</span>
                Abrir validador maestro
              </button>
            </div>
          </article>
        </div>
      </section>

      <nav className={styles.bottomNav} aria-label="Navegación principal">
        <a href="#learninghub" className={`${styles.navItem} ${styles.navItemActive}`}>
          <span aria-hidden>🎓</span>
          Training
        </a>
        <a href="#derivacion" className={styles.navItem}>
          <span aria-hidden>📋</span>
          Referrals
        </a>
        <a href="#tabla" className={styles.navItem}>
          <span aria-hidden>📊</span>
          Availability
        </a>
        <a href="#learninghub" className={styles.navItem} onClick={scrollToCostosSection}>
          <span aria-hidden>💲</span>
          Costs
        </a>
        <a href="#tabla" className={styles.navItem}>
          <span aria-hidden>📁</span>
          Registry
        </a>
      </nav>
    </div>
  );
};

export default LearningHub;
