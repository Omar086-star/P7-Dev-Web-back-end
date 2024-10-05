require("dotenv").config();
 
const { app } = require('./config/App'); // Importation de l'application Express
const morgan = require('morgan'); // Middleware pour les logs HTTP
 const { usersRouter } = require('./controllers/users.controller'); // Routes pour l'authentification
 const { booksRouter } = require('./controllers/books.controller'); // Routes pour les livres

// Définir le port du serveur (à partir de .env ou par défaut à 3000)
const PORT = process.env.PORT || 4000;

// Middleware de logging des requêtes HTTP
app.use(morgan('dev'));

// Route principale (pour tester que l'API fonctionne)
app.get('/', (req, res) => res.send("Bienvenue sur l'API !"));

// Utilisation des routes
app.use('/api/auth', usersRouter);
app.use('/api/books', booksRouter);

// Gestion des routes inexistantes (404)
app.use((req, res) => {
  res.status(404).json({ message: 'Route non trouver' });
});

// Gestion globale des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack); // Affiche l'erreur dans la console pour le débogage
  res.status(500).json({ message: 'Une erreur interne est survenue' });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
