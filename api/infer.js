// Vercel Serverless Function
// Proxy seguro: recibe imagen del frontend, agrega API key del entorno, llama a Roboflow.
// La API key NUNCA se expone al cliente.

export const config = {
  api: {
    bodyParser: { sizeLimit: '5mb' }, // imágenes base64 pesadas
  },
};

export default async function handler(req, res) {
  // Solo POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Validar configuración del servidor
  const apiKey = process.env.ROBOFLOW_API_KEY;
  const workspace = process.env.ROBOFLOW_WORKSPACE;
  const workflow = process.env.ROBOFLOW_WORKFLOW;

  if (!apiKey || !workspace || !workflow) {
    return res.status(500).json({
      error: 'Servidor mal configurado. Faltan variables de entorno ROBOFLOW_*'
    });
  }

  // Validar body
  const { image } = req.body || {};
  if (!image || typeof image !== 'string') {
    return res.status(400).json({ error: 'Falta campo "image" (base64 string)' });
  }

  // Llamar a Roboflow
  try {
    const url = `https://serverless.roboflow.com/infer/workflows/${workspace}/${workflow}`;
    const upstream = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: apiKey,
        inputs: { image: { type: 'base64', value: image } },
      }),
    });

    const data = await upstream.json();
    return res.status(upstream.status).json(data);
  } catch (e) {
    return res.status(502).json({ error: 'Upstream error: ' + e.message });
  }
}
