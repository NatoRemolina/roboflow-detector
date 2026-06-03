# Real-Time Object Detection — Lambda Analytics

> **Hacia el futuro de la visión por computadora.**  
> Solución de detección de objetos en tiempo real sobre dispositivos móviles, construida por el equipo de AI Engineering de **[Lambda Analytics](https://lambdaanalytics.co/)**.

---

## ¿Qué es esto?

Una aplicación web progresiva (PWA) que convierte cualquier dispositivo móvil en un sistema de visión por computadora en tiempo real. Captura video de la cámara, ejecuta inferencia sobre un modelo COCO pre-entrenado (80 clases) y superpone los bounding boxes detectados directamente sobre el stream de video — sin instalar nada, sin fricción para el usuario final.

Diseñada para demostrar las capacidades de computer vision de Lambda Analytics en entornos de cliente.

---

## Arquitectura

```
Dispositivo móvil          Vercel Edge (Serverless)        Roboflow Cloud
──────────────────         ────────────────────────        ──────────────
 Captura frame JPEG  ───►  POST /api/infer                 Modelo COCO/8
 (~320px, 60ms)            + ROBOFLOW_API_KEY  ─────────►  80 clases
                           (nunca sale al cliente)          ~70ms inferencia
                    ◄───   Predicciones JSON   ◄─────────
 Canvas overlay
 a 60fps (RAF)
```

**Dos loops desacoplados:**
- `inferenceLoop` — envía un frame cada 250ms (4 fps de inferencia), asíncrono
- `renderLoop` — dibuja bounding boxes a 60fps sobre canvas, sin bloquear el video

Esto garantiza video fluido independientemente de la latencia de red.

---

## Stack técnico

| Capa | Tecnología | Decisión de diseño |
|------|-----------|-------------------|
| Frontend | HTML/CSS/JS vanilla | Cero dependencias, carga instantánea |
| Backend | Vercel Serverless (Node 18) | API key segura en entorno, no en cliente |
| Modelo | Roboflow COCO/8 | 80 clases, ~70ms, sin GPU local |
| Deploy | Vercel CDN global | HTTPS, headers de seguridad, sin configuración |
| UI | Canvas API + CSS animations | Sin frameworks, 60fps garantizados |

---

## Capacidades

- **Detección de 80 clases COCO** — personas, vehículos, animales, objetos cotidianos
- **Bounding boxes con fade-in** — animación suave al aparecer nuevas detecciones
- **Panel de objetos activos** — lista en tiempo real con emoji, barra de confianza y porcentaje
- **Historial de sesión** — top 5 clases más detectadas con gráfico proporcional
- **Feedback háptico + audio** — vibración y ping sonoro al detectar una clase nueva
- **Toggle cámara frontal/trasera** — sin recargar la página
- **Diseño PWA** — instalable en pantalla de inicio de iPhone

---

## Seguridad implementada

```
✅ API key exclusivamente en variable de entorno del servidor
✅ Validación de método HTTP y estructura del body en el backend
✅ Headers: X-Content-Type-Options · Referrer-Policy · Permissions-Policy: camera=(self)
✅ Cache-Control: no-store en todos los endpoints de inferencia
✅ .env ignorado por git — nunca expuesto en historial
```

---

## Desarrollo local

```bash
# 1. Clonar y configurar credenciales
cp .env.example .env.local
# Editar .env.local con la API key de Roboflow

# 2. Iniciar servidor local con hot-reload
npx vercel dev

# 3. Abrir en el navegador
open http://localhost:3000
```

---

## Deploy a producción

```bash
vercel env add ROBOFLOW_API_KEY production
vercel --prod
```

La URL resultante funciona directamente en cualquier dispositivo móvil con Safari o Chrome. Para distribución interna: generar QR y compartir — sin instalación requerida.

---

## Estructura del proyecto

```
roboflow-detector/
├── index.html          Frontend completo (PWA, sin dependencias)
├── api/
│   └── infer.js        Serverless proxy — protege la API key
├── vercel.json         Headers de seguridad + configuración de funciones
├── .env.example        Plantilla de variables de entorno
└── .gitignore
```

---

**Lambda Analytics** · [lambdaanalytics.co](https://lambdaanalytics.co/) · Creamos Futuro
