import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { initializeDatabase } from './database';
import whatsappRoutes from './whatsappRoutes';

// Configuración de variables de entorno
dotenv.config();

// Inicialización de la base de datos
initializeDatabase();

const app = express();
const port = process.env.PORT || 3000;


// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json())

console.log("Server port: " + port);
console.log("Server listo para funcionar.");
// Rutas
app.use('/webhook', whatsappRoutes);

// Ruta principal
app.get('/', (req, res) => {
  res.send('Servidor funcionando correctamente!');
});

// Verificación del Webhook
app.get('/webhook', (req, res) => {
    console.log('GET request to /webhook received'); // Para depurar las solicitudes GET

    const verify_token = process.env.VERIFY_TOKEN;
  
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    
    console.log(`mode:${mode}`);

    if (mode && token) {
      if (mode === 'subscribe' && token === verify_token) {
        res.status(200).send(challenge);
      } else {
        res.sendStatus(403);
      }
    }
  });

// Manejo de errores
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Algo salió mal!');
});

// Inicio del servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
