const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
// define schema
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'], // validator ;  second in the array is the error string
      unique: true, // cannot have 2 objects with the same name
      trim: true,
      maxlength: [40, 'A tour name must have less than 41 characters'],
      minlength: [10, 'A tour name must have more than 9 characters'], // minlength and maxlength only on strings
      // validate: [validator.isAlpha, 'Tour name must only contain characters'], // external library no need to call, it will be called automatically as soon as data should be validated
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'], // validator
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message:
          'A tour must have a difficulty set to easy, medium or difficult', // enum only on strings
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Ratings must be at least 1.0'],
      max: [5, 'Rating must be max 5.0'], // works with numbers and dates
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price; // this does only work on new documents not on update
        },
        message: 'Discount  ({VALUE}) can not be higher than the price',
      },
    },
    summary: {
      type: String,
      trim: true, // removes all white space at the beginning and end of the string
      required: [true, 'A tour must have a description'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String, // just the name of the image
      required: [true, 'A tour must have a cover image'],
    },
    images: [String], // saves it as an array of strings
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false, // hides in the results
    },
    startDates: [Date],
    secretTour: Boolean,
    default: false,
  },
  // + Options after the Schema
  { toJSON: { virtuals: true } }, // allows for virtuals if data is outputed as JSON
  { toObject: { virtuals: true } } // when the data gets outputted as an Object it allows for virtuals
);

//Virtual properties ; dont persist in the database but only be there as soon as we get the data; Cannot be used in a query
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});
//

//DOCUMENT MIDDLEWARE: to manipulate documents that are being saved; runs before .save() and .create() mongoose methods; BUT does not trigger with .insertMany() etc.!

//pre middleware has access to next ; pre-save hook
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
  //this is the currently processed document;
});

// we can have multiple pre or post middlewares on the same hook (save)
// tourSchema.pre('save', function (next) {
//   console.log('Will save document...');
//   next();
// });

// // post has access to next and the document that was just saved to the DB
// tourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });

// QUERY MIDDLEWARE
tourSchema.pre(/^find/, function (next) {
  // tourSchema.pre('find', function (next) { /^find/ means ALL hooks that start with find
  this.find({ secretTour: { $ne: true } });
  // this keyword points at the current query ; find-hook makes it query middleware
  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds`);

  next();
}); // runs after the query has been executed therefore has accses to the returned documents

///// AGGREGATION MIDDLEWARE
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({
    $match: {
      secretTour: { $ne: true },
    },
  });
  console.log(this.pipeline()); // this points to the current aggregation object
  next();
});

const Tour = mongoose.model('Tour', tourSchema);
// creates a model out of the schema

// const Vacation = mongoose.model('Vacation', tourSchema);
// const testVacation = new Vacation({
//   name: 'The Sea-side Camper',
//   rating: 4.1,
//   price: 697,
// });
// testVacation
//   .save()
//   .then((doc) => console.log(doc))
//   .catch((err) => console.log(err));
// saves it to the tours collection in the database; returns a promise and we handle it with then

module.exports = Tour;
