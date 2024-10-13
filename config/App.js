const express = require("express");
const cors = require("cors");
const app = express();
const path = require("path");

// Importation de la connexion à MongoDB
require("./../db/mongo.js"); 

// Configuration du dossier d'images (à partir de .env)
const IMAGES_FOLDER = String(process.env.IMAGES_FOLDER);

// Configuration des options CORS
const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:3001'], // Autorise plusieurs origines
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true, // Si vous utilisez les cookies ou les sessions
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Middleware CORS
app.options('*', cors(corsOptions)); // Répond aux requêtes prévol CORS pour toutes les routes


// Middleware pour lire les JSON dans les requêtes
app.use(express.json());

// Servir les fichiers statiques (images) à partir du dossier configuré
// app.use("/" + process.env.IMAGES_PUBLIC_URL, express.static(IMAGES_FOLDER));

app.use("/uploads", express.static(path.join(__dirname, '../uploads')))

module.exports = { app };

