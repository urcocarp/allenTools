# Desplegar AllenTools (gratis)

El proyecto ya está listo para deploy. Opciones recomendadas:

---

## Opción 1: Vercel (recomendada)

1. **Subí el proyecto a GitHub** (si aún no está):
   ```bash
   git remote add origin https://github.com/TU-USUARIO/allenTools.git
   git add .
   git commit -m "Deploy ready"
   git push -u origin main
   ```

2. Entrá a **[vercel.com](https://vercel.com)** e iniciá sesión (con GitHub).

3. **Import Project**: elegí "Import Git Repository" y seleccioná el repo `allenTools`.

4. Vercel detecta Vite solo; no cambies nada. Clic en **Deploy**.

5. En unos segundos te dan una URL tipo: `https://allentools-xxx.vercel.app`.

**Actualizaciones:** cada vez que hagas `git push` a `main`, Vercel vuelve a desplegar solo.

---

## Opción 2: Netlify

1. Subí el código a GitHub (igual que arriba).

2. Entrá a **[netlify.com](https://netlify.com)** → "Add new site" → "Import an existing project" → GitHub → repo `allenTools`.

3. Configuración (Netlify suele detectarla):
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`

4. Deploy. Te dan una URL tipo: `https://nombre-random.netlify.app`.

---

## Opción 3: Deploy desde la PC (sin GitHub) con Vercel CLI

```bash
npm i -g vercel
cd /home/nicolas/allenTools
vercel
```

Seguí los pasos (login si hace falta). Te da una URL al finalizar.

---

## Resumen

| Servicio   | Ventaja                    | URL típica                    |
|-----------|----------------------------|-------------------------------|
| **Vercel**  | Muy simple, deploy con Git | `*.vercel.app`                |
| **Netlify** | Similar, también con Git   | `*.netlify.app`               |
| **Vercel CLI** | Sin GitHub, desde tu PC  | `*.vercel.app`                |

Cualquier opción es gratuita para este proyecto.
