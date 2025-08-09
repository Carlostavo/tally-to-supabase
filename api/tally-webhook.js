import { createClient } from '@supabase/supabase-js';

// **Variables de entorno de Supabase:**
// Asegúrate de que estas variables estén configuradas en tu proyecto de Vercel.
// Son necesarias para que tu función se conecte a tu base de datos Supabase de forma segura.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Inicializa el cliente de Supabase con tus credenciales.
const supabase = createClient(supabaseUrl, supabaseKey);

// **Función auxiliar para extraer el valor de un campo por su 'label':**
// Tally envía los datos en un array de objetos 'fields', donde cada objeto tiene un 'label'
// (el nombre visible de la pregunta) y un 'value' (la respuesta).
const getFieldValueByLabel = (fieldsArray, labelToFind) => {
  // Busca el campo en el array 'fieldsArray' cuyo 'label' coincide con 'labelToFind'.
  const field = fieldsArray.find(fieldItem => fieldItem.label === labelToFind);
  // Si el campo se encuentra, devuelve su 'value'; de lo contrario, devuelve null.
  return field ? field.value : null;
};

// **Función principal del manejador del webhook:**
// Esta función se ejecuta cada vez que Tally envía una petición POST a tu URL de webhook.
export default async function handler(req, res) {
  // **Validación del método de petición:**
  // Asegura que solo las peticiones POST sean procesadas, rechazando otras (GET, PUT, etc.).
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed', message: 'Only POST requests are accepted.' });
  }

  // **Cuerpo de la petición (payload de Tally):**
  // El cuerpo de la petición contiene los datos del formulario enviado por Tally.
  const payload = req.body;

  // **Validación básica del payload:**
  // Verifica que el payload no esté vacío y que contenga la estructura esperada 'data.fields'.
  if (!payload || !payload.data || !Array.isArray(payload.data.fields)) {
    console.error('Payload is invalid or fields array is missing/not an array:', payload);
    return res.status(400).json({ error: 'Invalid Payload', message: 'The received data structure is not as expected from Tally.' });
  }

  // **Extracción de datos del payload de Tally:**
  // Usamos la función auxiliar 'getFieldValueByLabel' para obtener los valores
  // de las respuestas del formulario basándonos en sus etiquetas (labels) exactas de Tally.
  // Es crucial que las etiquetas aquí coincidan exactamente con las de tu formulario Tally.
  const nombre = getFieldValueByLabel(payload.data.fields, 'Nombre');
  const apellido = getFieldValueByLabel(payload.data.fields, 'Apellido');
  const numeroCelular = getFieldValueByLabel(payload.data.fields, 'Número celular'); // 'Número celular' en Tally
  const fecha = getFieldValueByLabel(payload.data.fields, 'Fecha');
  const hora = getFieldValueByLabel(payload.data.fields, 'Hora');
  const colorFavorito = getFieldValueByLabel(payload.data.fields, 'Color Favorito'); // 'Color Favorito' en Tally

  try {
    // **Inserción de datos en Supabase:**
    // Inserta los datos extraídos en la tabla 'formulario' de tu base de datos Supabase.
    // Los nombres de las claves en este objeto (ej. "Nombre", "Apellido")
    // DEBEN coincidir EXACTAMENTE con los nombres de tus columnas en la tabla 'public.formulario' de Supabase,
    // incluyendo mayúsculas, minúsculas y espacios.
    const { data: insertedData, error } = await supabase
      .from('formulario') // Nombre exacto de tu tabla en Supabase
      .insert([
        {
          "Nombre": nombre,                 // Columna "Nombre" en Supabase
          "Apellido": apellido,             // Columna "Apellido" en Supabase
          "Numero celular": numeroCelular,  // Columna "Numero celular" en Supabase (sin tilde)
          "Fecha": fecha,                   // Columna "Fecha" en Supabase
          "Hora": hora,                     // Columna "Hora" en Supabase
          "Color favorito": colorFavorito   // Columna "Color favorito" en Supabase (con 'f' minúscula)
        }
      ])
      .select(); // El método .select() hace que Supabase devuelva los datos de la fila insertada.

    // **Manejo de errores de inserción:**
    // Si Supabase devuelve un error durante la inserción, lo registramos y enviamos una respuesta de error.
    if (error) {
      console.error('Supabase insertion error:', error);
      return res.status(500).json({ error: 'Supabase Insertion Failed', details: error.message });
    }

    // **Respuesta de éxito:**
    // Si la inserción es exitosa, registramos los datos insertados y enviamos una respuesta de éxito.
    console.log('Data successfully inserted into Supabase:', insertedData);
    res.status(200).json({ message: 'Form data received and inserted successfully!', data: insertedData });

  } catch (err) {
    // **Manejo de errores inesperados:**
    // Captura cualquier otro error que pueda ocurrir durante el proceso.
    console.error('Unexpected error in webhook handler:', err);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
}
