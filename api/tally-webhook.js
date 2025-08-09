import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { Nombre, Apellido, "Número celular": NumeroCelular, Fecha, Hora, "Color favorito": ColorFavorito } = req.body;

    const { data, error } = await supabase
      .from('Formulario')
      .insert([
        {
          Nombre,
          Apellido,
          "Número celular": NumeroCelular,
          Fecha,
          Hora,
          "Color favorito": ColorFavorito
        }
      ]);

    if (error) throw error;

    return res.status(200).json({ message: 'Datos guardados', data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
