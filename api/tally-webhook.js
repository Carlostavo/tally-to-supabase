import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { data } = req.body;

    if (!data || !data.fields) {
      return res.status(400).json({ error: 'Invalid Tally payload' });
    }

    // Función para obtener el valor por etiqueta (label)
    const getValue = (label) => {
      const field = data.fields.find(f => f.label.toLowerCase() === label.toLowerCase());
      return field ? field.value : null;
    };

    const nombre = getValue('Nombre');
    const apellido = getValue('Apellido');
    const numeroCelular = getValue('Número celular');
    const fecha = getValue('Fecha');
    const hora = getValue('Hora');
    const colorFavorito = getValue('Color Favorito');

    const { data: inserted, error } = await supabase
      .from('formulario')
      .insert([
        {
          Nombre: nombre,
          Apellido: apellido,
          "Numero celular": numeroCelular,
          Fecha: fecha,
          Hora: hora,
          "Color favorito": colorFavorito
        }
      ])
      .select(); // Para ver lo insertado

    if (error) throw error;

    console.log('Data inserted successfully:', inserted);

    return res.status(200).json({ message: 'Datos guardados', data: inserted });

  } catch (err) {
    console.error('Error inserting data:', err);
    return res.status(500).json({ error: err.message });
  }
}
