const fs = require('fs');
const multer = require('multer');
const sharp = require("sharp");

function compression(req) {
  compressionEtape1(req)
  compressionEtape2(req)
}
function compressionEtape1(req) {
  const inputPath = req.file.path
  const outputPath = `uploads\\${req.file.filename}.webp`;

  sharp(inputPath)
  .toFormat("webp")
  .webp({ quality: 20 })
  .toFile(outputPath)
  .then(() => console.log('Image compressed successfully:', outputPath))
  .catch(err => console.error('Compression failed:', err));
}
function compressionEtape2(req) {
  sharp.cache(false)
  setTimeout(() => {
    fs.unlink(`uploads/${req.file.filename}` , (err) => {
      if (err) console.error(err)
    })
  }, 300)
};

const { upload } = require("../middlewares/multer");
const  Book  = require("../models/Book");
const express = require('express');
const jwt = require("jsonwebtoken");

const booksRouter = express.Router();
booksRouter.get("/bestrating", getBestRating);

booksRouter.get("/:id", getBookById);

booksRouter.get("/", getBooks);
booksRouter.post("/", checkToken, upload.single('image'), postBook);
booksRouter.delete("/:id", checkToken, deleteBook);
booksRouter.put("/:id", checkToken,upload.single('image'),  putBook);

booksRouter.post("/:id/rating", checkToken, postRating);

const app = express();
app.use(express.json());
app.use(express.urlencoded({
  extended:true
}));

async function postRating(req, res) {
  const id = req.params.id;
  if (id == null || id == "undefined") {
    res.status(400).send("Book id is missing");
    return;
  }
  const rating = req.body.rating;
  const userId = req.tokenPayload.userId;
  try {
    const book = await Book.findById(id);
    if (book == null) {
      res.status(404).send("Book is not found");
      return;
    }
    const ratingsList = book.ratings;
    const oldRatings = ratingsList.find((rating) =>
rating.userId == userId);
    if (oldRatings != null) {
      res.status(400).send("You have rated this book");
      return;
    }
    const newRating = { userId, grade: rating };
    ratingsList.push(newRating);
    book.averageRating = calculateAverageRating(ratingsList);
    await book.save();
    res.send("Rating posted");
  } catch (e) {
    console.error(e);
    res.status(500).send("Something went wrong:" + e.message);
  }
}

function calculateAverageRating(ratings) {
const sumOfAllGrades = ratings.reduce((sum, rating) => sum +
rating.grade, 0);
return sumOfAllGrades / ratings.length;
}

async function getBestRating(req, res) {
try{
const booksRating= await Book.find().sort( {rating: -1}).limit(3);
res.send(booksRating);
console.log(booksRating)
} catch(e){
  res.status(500).send("something went wrong" + e.message)
  console.error(e )
} }

async function putBook(req, res) {

  const id = req.params.id;
  upload.single('image')(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(500).json({ message: 'Upload error: ' + err.message });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }

    const bookData =  req.body;
    try {
      const bookInDb = await Book.findById(id);
      if (!bookInDb) {
        return res.status(404).json({ message: "Book not found" });
      }

      const userIdInDb = bookInDb.userId;
      const userIdInToken = req.tokenPayload.userId;
      if (userIdInDb !== userIdInToken) {
        return res.status(403).json({ message: "You cannot modify other people's books" });
      }
      
      const updatedBook = {
        title: bookData.title || bookInDb.title,
        author: bookData.author || bookInDb.author,
        year: bookData.year || bookInDb.year,
        genre: bookData.genre || bookInDb.genre,
        imageUrl: req.file ? req.file.filename : bookInDb.imageUrl // Si une image a été téléchargée
      };

      await Book.findByIdAndUpdate(id, updatedBook);
      res.json({ message: "Book updated successfully", book: updatedBook });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: "Something went wrong: " + e.message });
    }
  });
}

async function deleteBook(req, res) {
   const id = req.params.id;
   try {
     const bookInDb = await Book.findById(id);
     if (bookInDb == null) {
       res.status(404).send("Book not found");
       return;
     }
     const userIdInDb = bookInDb.userId;
     const userIdInToken = req.tokenPayload.userId;
     if (userIdInDb != userIdInToken) {
       res.status(403).send("You cannot delete other people's books");
       return;
     }
     await Book.findByIdAndDelete(id);
     res.send("Book deleted");
   } catch (e) {
     console.error(e);
     res.status(500).send("Something went wrong:" + e.message);
   }
}

function checkToken(req, res, next) {
   const headers = req.headers;
   const authorization = headers.authorization;
   if (authorization ==
     null) {
     res.status(401).send("Unauthorized");
     return;
   }
   const token = authorization.split(" ")[1];
   try {
     const jwtSecret = String(process.env.JWT_SECRET);
     const tokenPayload = jwt.verify(token, jwtSecret);
     if (tokenPayload == null) {
       res.status(401).send("Unauthorized");
       return;
     }
     req.tokenPayload = tokenPayload;
     next();
   } catch (e) {
     console.error(e);
     res.status(401).send("Unauthorized");
   }
}

async function getBookById(req, res) {
   const id = req.params.id;
   
   try {
     const book = await Book.findById(id);
     if (book == null) {
       res.status(404).send("Book not found");
       return;
     }
     console.log("c est l'image : " + book.imageUrl) ;
      res.send(book);

   } catch (e) {
     console.error(e);
     res.status(500).send("Something went wrong:" + e.message);
   }
}

async function postBook(req, res) {
  const file = req.file;
  const bookData = JSON.parse(req.body.book);
  let imageUrl = null;

  if (file) {
    // Générer une URL d'image cohérente avec .webp
    imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}.webp`;

    // Appeler la compression et vérifier qu'elle réussit
    const inputPath = req.file.path;
    const outputPath = `uploads/${req.file.filename}.webp`;
    try {
      await sharp(inputPath)
        .toFormat("webp")
        .webp({ quality: 20 })
        .toFile(outputPath);
      console.log('Image compressed successfully:', outputPath);
    } catch (err) {
      console.error('Compression failed:', err);
      return res.status(500).json({ message: "Image compression failed: " + err.message });
    }
  }
  compression(req);
  const userId = req.tokenPayload.userId;
  const newBook = {
    userId: userId,
    title: bookData.title,
    author: bookData.author,
    year: bookData.year,
    genre: bookData.genre,
    imageUrl: imageUrl,
    rating: bookData.ratings,
    averageRating: bookData.averageRating
  };

  try {
    const result = await Book.create(newBook);
    res.status(201).json({ message: "Book created successfully", book: result });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Something went wrong: " + e.message });
  }
}

app.use('/uploads', express.static('uploads'));
 
async function getBooks(req, res) {


try {
  const books = await Book.find(); // Utilisation de `await`
  res.json(books); // Envoyer les livres dans la réponse
// console.log(books + ': main ');
} catch (e) {
  console.error(e);
  res.status(500).json({ message: "Something went wrong: " + e.message });
}
// pour tester




}



module.exports = { booksRouter };






// async function postBook(req, res) {
// const file = req.file;
// const stringifieBook= req.body.book;
// const book= JSON.parse(stringifieBook);
// book.imageUrl=file.path;

//    upload.single('file') 

// const bookData = JSON.parse(req.body.book);


// // pour tester 

// // let image =null;
// // if(req.file){
// //   const host = 'localhost:3000'; // Replace with your host
// //   image = 'http://${host}/uploads/${req.file.filename}';
// // }


// let image = null;
// if (req.file) {
//   const host = 'localhost:3000'; // Remplacer par l'hôte correct si nécessaire
//   image = `http://${host}/uploads/${req.file.filename}`; // Utiliser les backticks
// }

// // pour tester 











// const userId = req.tokenPayload.userId;
// const newBook = {
//         userId: userId,
//         title: bookData.title,
//         author: bookData.author,
//         year: bookData.year,
//         genre: bookData.genre,
//         imgURL:image,
//         rating: bookData.ratings,
//         averageRating: bookData.averageRating
//       };
     
 
//      try {
//       const result = await Book.create(newBook);
//       res.send({ message:"book lancer" , Book:result });

//       //  await Book.create(newBook); // Sauvegarder dans MongoDB
//       //  res.status(201).json({ message: "Book created successfully", book: newBook });
//      } catch (e) {
//        console.error(e);
//        res.status(500).json({ message: "Something went wrong: " + e.message });
//      }
   
// app.use('/uploads' , express.static('uploads'));

//  }

 