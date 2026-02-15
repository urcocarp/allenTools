# Deploy AllenTools – Pasos juntos

## 1. Subir el código a GitHub (en tu PC)

Abrí una terminal **en tu computadora** (fuera de Cursor si hace falta) y ejecutá:

```bash
cd /home/nicolas/allenTools
git push -u origin main
```

- Si te pide **usuario**: tu usuario de GitHub (ej: `urcocarp`).
- Si te pide **contraseña**: ya no se usa la contraseña de la cuenta. Tenés que usar un **Personal Access Token**:
  1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic).
  2. "Generate new token", marcar `repo`.
  3. Copiá el token y usalo como contraseña cuando Git lo pida.

**Alternativa con SSH** (si tenés llave configurada en GitHub):

```bash
git remote set-url origin git@github.com:urcocarp/allenTools.git
git push -u origin main
```

Cuando el `git push` termine sin errores, seguí al paso 2.

---

## 2. Conectar con Vercel y deployar

1. Entrá a: **https://vercel.com/new**
2. Iniciá sesión con **GitHub** (si no tenés cuenta Vercel, la creás con GitHub).
3. En "Import Git Repository" debería aparecer **urcocarp/allenTools**. Si no:
   - Clic en "Adjust GitHub App Permissions" y autorizá a Vercel para ver el repo.
   - Volvé a "Import" y elegí **allenTools**.
4. Clic en **Import** (no cambies Framework ni Build Command; Vercel detecta Vite).
5. Clic en **Deploy**.
6. En 1–2 minutos te dan la URL de la app, por ejemplo:  
   `https://allen-tools-xxx.vercel.app`

---

## 3. Listo

Esa URL es tu app en vivo. Cada vez que hagas `git push` a `main`, Vercel va a volver a desplegar solo.

Si en el paso 1 o 2 algo falla, copiá el mensaje de error y lo vemos.
