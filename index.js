const express = require('express');
const cors = require('cors');
const { User , Book } = require('./db/mongo');
const app = express();
const bcrypt = require("bcrypt");
const { books } = require('./db/books');
const multer = require('multer');

const storage=multer.diskStorage({
  destination: function (req, file , cb){
    cb(null , "uploads");
  },
  filename: function (req , file , cb){
    const filename= file.originalname.toLocaleLowerCase() + Date.now() + ".jpg";
    cb(null, Date.now() + "-" + filename)
  }
})

const upload=multer({
  storage:storage
})


const port = 4000;

app.use(cors());
app.use(express.json());
app.use("/images", express.static("uploads"))

let browserOpened = false;

app.get('/', testLeProjet);
app.post('/api/auth/signup', signUp);
app.post('/api/auth/login', logIn);
app.get('/api/books' , getBooks);
app.post('/api/books',upload.single("image"), postBook);

 

app.listen(port, async function () {
  console.log(`Serveur en cours d'exécution sur http://localhost:${port}`);
  if (!browserOpened) {
    const open = (await import('open')).default;
    await open(`http://localhost:${port}`);
    browserOpened = true;
  }
});

app.use((req, res) => {
  res.status(404).send("Désolé, cette page n'existe pas !");
});

app.use((err, req, res) => {
  console.error(err.stack);
  res.status(500).send('Quelque chose a mal tourné !');
});

// Les fonctions de signUP, logIN et getBooks

function testLeProjet(req, res) {
  res.send('Hello World!');
}

async function signUp(req, res) {
  const email = req.body.email;
  const password = req.body.password;

  const userList = await User.findOne({ email: email });
  if (userList != null) {
    res.status(400).send("Email déjà existe");
    return;
  }

  const user = { email: email, password: hashPassword(password) };

  try {
    await User.create(user);
  } catch (e) {
    console.error(e);
    res.status(500).send("Erreur serveur");
    return;
  }

  console.log('Body:', req.body);
  res.send("Sign UP");
}

async function logIn(req, res) {
  console.log('Requête reçue sur /api/auth/login');
  const userList = await User.findOne({ email: req.body.email });

  if (userList == null) {
    res.status(401).send("Email incorrect");
    return;
  }

  if (!isPasswordCorrect(req.body.password, userList.password)) {
    res.status(401).send("Mot de passe incorrect");
    return;
  }

  res.send({
    userId: userList._id,
    token: "token"
  });
}

function hashPassword(password) {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
}

function isPasswordCorrect(password, hash) {
  return bcrypt.compareSync(password, hash);
}

function getBooks(req, res) {
  res.send(books);
};

async function postBook(req,res){
const file = req.file;
console.log("file:" , file
  
)
const body = req.body;
const strigBook= req.body.book;
const book = JSON.parse(strigBook);
book.imageUrl = file.path;
try{
const result = await Book.create(book);
console.log("resul :" ,result);
res.send({message:'Book pupler' , book: result})
}
catch(e){
  console.error(e);
  res.status(500).send('Somthing went wrong' + e.message);
}
}