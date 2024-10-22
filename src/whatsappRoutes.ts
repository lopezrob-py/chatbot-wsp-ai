import express from 'express';
import sqlite3 from 'sqlite3';
import { openaiResponse, getPrompt } from './openaiService';
import { sendMessage, sendMessageWithButtons } from './sendMessageWithButtons';
import { getDatabase } from './database';

const db = getDatabase();
const router = express.Router();
const correccionesPendientes: { [key: string]: string } = {};

// Validaciones de campos
const validarNombreApellido = (input: string) => /^[a-zA-Z]+$/.test(input);
const validarCedula = (input: string) => /^[a-zA-Z0-9]+$/.test(input);
const validarFechaNacimiento = (input: string) => /^\d{2}\/\d{2}\/\d{4}$/.test(input);
const validarSituacionLaboral = (input: string) => ['Empleado Público', 'Empleado Privado', 'Jubilado / Pensionista', 'Independiente'].includes(input);

// Opciones de situación laboral
const opcionesLaborales = [
  { title: 'Empleado Público', payload: 'Empleado Público' },
  { title: 'Empleado Privado', payload: 'Empleado Privado' },
  { title: 'Jubilado / Pensionista', payload: 'Jubilado / Pensionista' },
  { title: 'Independiente', payload: 'Independiente' },
];

router.post('/webhook', async (req, res) => {
    console.log('POST request to /webhook received'); // Para depurar las solicitudes POST
    console.log('Request body:', JSON.stringify(req.body, null, 2));
  const body = req.body;

  if (body.object) {
    if (body.entry && body.entry[0].changes && body.entry[0].changes[0].value.messages) {
      const message = body.entry[0].changes[0].value.messages[0];
      const from = message.from;
      const text = message.text.body.toLowerCase();

      db.get('SELECT * FROM usuarios WHERE telefono = ?', [from], async (err, usuario) => {
        if (err) {
          console.error('Error al obtener datos del usuario:', err.message);
          return;
        }

        if (usuario) {
          if (correccionesPendientes[from]) {
            // El usuario está en proceso de corrección de datos
            const campoACorregir = correccionesPendientes[from];
            let nuevoValor = text;

            // Validación de cada campo
            if (campoACorregir === 'nombre' && !validarNombreApellido(nuevoValor)) {
              await sendMessage(from, getPrompt('solicitar_nombre'));
              return;
            }
            if (campoACorregir === 'apellido' && !validarNombreApellido(nuevoValor)) {
              await sendMessage(from, getPrompt('solicitar_apellido'));
              return;
            }
            if (campoACorregir === 'cedula' && !validarCedula(nuevoValor)) {
              await sendMessage(from, getPrompt('solicitar_cedula'));
              return;
            }
            if (campoACorregir === 'fecha_nacimiento' && !validarFechaNacimiento(nuevoValor)) {
              await sendMessage(from, getPrompt('solicitar_fecha_nacimiento'));
              return;
            }
            if (campoACorregir === 'situacion_laboral' && !validarSituacionLaboral(nuevoValor)) {
              await sendMessageWithButtons(from, getPrompt('solicitar_situacion_laboral'), opcionesLaborales);
              return;
            }

            // Actualizar en la base de datos
            const query = `UPDATE usuarios SET ${campoACorregir} = ? WHERE telefono = ?`;
            db.run(query, [nuevoValor, from]);

            // Limpiar corrección pendiente y mostrar resumen actualizado
            delete correccionesPendientes[from];
            const usuarioActualizado = { ...usuario, [campoACorregir]: nuevoValor };
            await sendMessage(from, getPrompt('confirmacion_datos'));
          } else if (text.includes('corregir')) {
            await sendMessage(from, getPrompt('solicitar_campo_correccion'));
          } else if (text === 'sí' || text === 'es correcto' || text === 'todo bien') {
            await sendMessage(from, getPrompt('datos_guardados'));
          } else {
            await sendMessage(from, getPrompt('confirmacion_datos'));
          }

        } else {
          // Flujo para nuevos usuarios
          await sendMessage(from, getPrompt('solicitar_nombre'));
        }

        res.status(200).send('EVENT_RECEIVED');
      });
    } else {
      res.sendStatus(404);
    }
  }
});

export default router;
