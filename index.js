const express = require('express');
const cors = require('cors');

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

let browserOpened = false;

app.get('/', testLeProjet);
app.post('/api/auth/signup', signUp);
app.post('/api/auth/login', logIn);

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


// les function de signUP logIN
function testLeProjet(req, res) {
  res.send('Hello World!');
}
const users = [];
function signUp(req, res) {
  const body = req.body;
  const email = req.body.email;
  const password = req.body.password;
  const userList = users.find((user)=>user.email===email);
  if (userList!= null){
    res.status(400).send("Email déjà existe ");
    return;
  }
  const user = {
    email:email,
    password:password
  }
  users.push(user)
  console.log('Body:', body);
  res.send("Sign UP");
}
const admin ={
email:"mullaomar086@gmail.com",
password:"MULLAomar086"
}
function logIn(req, res) {
  console.log('Requête reçue sur /api/auth/login');
  const body = req.body;
  const userList=users.find((user)=>user.email===body.email);
  if(userList==null){
    res.status(401).send("mal écrire");
    return;
  }
  const passwordList = userList.password;
  if(passwordList!=body.password){
    res.status(401).send("mal écrire");
    return;
  }
 
  res.send({
    userId: "123",
    token: "token"
  });
}
