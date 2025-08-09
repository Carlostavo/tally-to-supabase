import { createClient } from '@supabase/supabase-js';

// Asegúrate de que estas variables de entorno estén configuradas en Vercel
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const payload = req.body;

  if (!payload || !payload.data) {
    return res.status(400).json({ error: 'Invalid data' });
  }

  // Extrae las variables del payload de Tally
  const { 
    Nombre, 
    Apellido, 
    "Número celular": numero_celular, 
    Fecha, 
    Hora, 
    "Color favorito": color_favorito 
  } = payload.data;

  try {
    // Inserta los datos en la tabla 'formulario' de Supabase
    const { data: insertedData, error } = await supabase
      .from('formulario')
      .insert([
        {
          "Nombre": Nombre,
          "Apellido": Apellido,
          "Numero celular": numero_celular,
          "Fecha": Fecha,
          "Hora": Hora,
          "Color favorito": color_favorito
        }
      ]);

    if (error) {
      console.error('Error inserting data:', error);
      return res.status(500).json({ error: 'Failed to insert data into Supabase' });
    }

    console.log('Data inserted successfully:', insertedData);
    res.status(200).json({ message: 'Success' });
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
}
