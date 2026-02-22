# Desplegar AllenTools (gratis)

El **frontend** (formulario, tabla, calculadora IVA) se despliega solo. Los registros se guardan en **localStorage** del navegador, así que sin backend la app funciona igual.

---

## Frontend (obligatorio)

### Opción 1: Vercel (recomendada)

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

---

## Backend opcional (guardar registros en servidor)

Si querés que los registros también se guarden en un servidor (y no solo en localStorage), desplegá el backend por separado:

1. **Railway** o **Render**: subí la carpeta `server/` como proyecto Node.
   - **Build:** no hace falta (o `npm install`).
   - **Start:** `npm start` (o `node index.js`).
   - En Railway/Render te dan una URL tipo `https://tu-api.railway.app` o `https://tu-api.onrender.com`.

2. En el **frontend** (Vercel/Netlify), agregá una variable de entorno:
   - **Nombre:** `VITE_API_URL`
   - **Valor:** la URL de tu backend (ej. `https://tu-api.onrender.com`).

3. Redeploy del frontend para que tome la variable. A partir de ahí, cada registro se envía también al servidor.

Si no desplegás backend, la app sigue funcionando solo con localStorage.
