// const mongoose = require("mongoose");

// const ratingSchema= new mongoose.Schema({
//     userId: {type:String, required:true},
//     grade: {type:Number, required:true}
// });
// const BookSchema = new mongoose.Schema({
//   userId:{type:String, required:true} ,
//   title: {type:String, required:true},
//   author: {type:String, required:true},
//   imageUrl: {type:String}, // Supprimer la redondance de la deuxième `imageUrl`
//   year: {type:String, required:true},
//   genre: {type:String, required:true},
//   rating: [ratingSchema],
//   averageRating: {type:Number, required:true}
// });



// const Book = mongoose.model("Book", BookSchema);
// module.exports = Book ;


const mongoose = require("mongoose")

const ratingBook = mongoose.Schema({
  userId: { type: String, required: true },
  grade: { type: Number, required: true },
})

const bookSchema = mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  author: { type: String, required: true },
  imageUrl: { type: String },
  year: { type: Number, required: true },
  genre: { type: String, required: true },
  ratings: [ratingBook],
  averageRating: { type: Number, required: true },
})

module.exports = mongoose.model("Book", bookSchema)