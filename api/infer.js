// Vercel Serverless Function — Backend proxy
// Recibe imagen del frontend, agrega API key del entorno, llama al modelo COCO
// de Roboflow (rápido, devuelve predictions JSON sin render server-side).
// El frontend dibuja los boxes sobre el video en vivo.

export const config = {
  api: {
    bodyParser: { sizeLimit: '5mb' },
  },
};

const MODEL = 'coco/8'; // COCO pre-trained, 80 clases, ~70ms inferencia

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ROBOFLOW_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Servidor mal configurado' });
  }

  const { image } = req.body || {};
  if (!image || typeof image !== 'string') {
    return res.status(400).json({ error: 'Falta campo "image" (base64 string)' });
  }

  try {
    const url = `https://detect.roboflow.com/${MODEL}?api_key=${apiKey}&confidence=40&overlap=30`;
    const upstream = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: image,
    });

    const data = await upstream.json();

    // Devolver solo lo esencial — payload pequeño
    if (data.predictions) {
      return res.status(200).json({
        predictions: data.predictions,
        image: data.image, // { width, height }
        time: data.time,
      });
    }
    return res.status(upstream.status).json(data);
  } catch (e) {
    return res.status(502).json({ error: 'Upstream error: ' + e.message });
  }
}
