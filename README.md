# Detector de Objetos Móvil — Roboflow

App web que abre tu cámara y detecta objetos en tiempo real usando un workflow de Roboflow. La API key vive en el servidor (variable de entorno), nunca se expone al cliente.

## Arquitectura

```
iPhone (Safari)                Vercel (tu hosting)              Roboflow Cloud
─────────────────              ───────────────────              ──────────────
1. Captura frame ─POST /api/infer─►
                                2. Lee ROBOFLOW_API_KEY
                                3. Reenvía a Roboflow ─────────► 4. Inferencia
                                5. Recibe predicción ◄──────────
                ◄── imagen anotada ── 6. Devuelve al cliente
7. Muestra resultado
```

## Estructura del proyecto

```
roboflow-app/
├── index.html        ← Frontend (público, NO contiene la API key)
├── api/
│   └── infer.js      ← Serverless function (proxy, usa la API key del entorno)
├── package.json
├── vercel.json       ← Configuración Vercel (headers de seguridad)
├── .env.example      ← Plantilla de variables
└── .gitignore
```

## Deploy en Vercel — 5 minutos

### 1. Crear cuenta y proyecto

1. Ve a [vercel.com](https://vercel.com) y crea una cuenta (puedes usar GitHub)
2. Instala Vercel CLI: `npm i -g vercel`

### 2. Configurar variables de entorno

En la terminal, desde la carpeta del proyecto:

```bash
cd /tmp/roboflow-app
vercel login
vercel link
vercel env add ROBOFLOW_API_KEY production
# pega tu Private API Key cuando lo pida

vercel env add ROBOFLOW_WORKSPACE production
# pega: natalias-workspace-q1def

vercel env add ROBOFLOW_WORKFLOW production
# pega: demo-objetos-cotidianos-1779560839102
```

### 3. Deploy

```bash
vercel --prod
```

Te dará una URL como `https://roboflow-detector-xxx.vercel.app`. Esa es la URL que comparte con quien quieras.

### 4. Generar QR

Cuando tengas la URL, genera un QR en cualquier generador (qr-code-generator.com) con esa URL. Cualquier persona que escanee el QR abre la app pre-configurada — no tiene que poner ninguna API key.

## Desarrollo local

```bash
cp .env.example .env.local
# edita .env.local con tu API key real
vercel dev
# abre http://localhost:3000
```

## Seguridad — buenas prácticas implementadas

✅ API key en variable de entorno (nunca en el código frontend)
✅ Backend valida método HTTP y forma del body
✅ Headers de seguridad: `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`
✅ No cachea respuestas del API (`Cache-Control: no-store`)
✅ `.env` ignorado por git

## Mejoras opcionales para producción

- **Rate limiting**: añadir Vercel KV o Upstash Redis para limitar requests por IP
- **Auth**: proteger el endpoint con un token o login si no quieres que sea público
- **Monitoring**: usar Vercel Analytics para tracking
- **CDN para imágenes**: si recibieras muchos requests, comprimir más agresivo

## Cómo usarlo desde el iPhone

1. Abre la URL de Vercel en Safari del iPhone
2. Toca **📷 Iniciar cámara**, acepta el permiso
3. Apunta a objetos y mira las detecciones
4. Para usarlo como app: **Compartir → Añadir a pantalla de inicio**

## Costos

- **Vercel:** gratis hasta 100 GB/mes de bandwidth (más que suficiente)
- **Roboflow:** consume créditos de tu workspace por cada inferencia
- Monitorea: Roboflow Settings → Usage
