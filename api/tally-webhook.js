import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    const payload = req.body;
    console.log("Payload recibido:", payload);

    // Convertir campos de Tally en objeto para insertar
    const datos = {};
    payload.data.forEach(field => {
      datos[field.label] = field.value;
    });

    const { error } = await supabase
      .from('Formulario') // Nombre de tu tabla
      .insert([datos]);

    if (error) throw error;

    return res.status(200).json({ message: 'Datos guardados en Supabase' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
