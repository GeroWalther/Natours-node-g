// const fs = require('fs');
const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summery,difficulty';
  next();
};

exports.getAllTours = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const tours = await features.query;

  // returns a query; GETS ALL TOURS FROM THE COLLECTION; find is to find all,  findOne for 1 and findById - shorthand for Model.findOne({ _id: req.params.id })
  // same but with mongoose methods
  // const tours = await Tour.find()
  //   .where('duration')
  //   .equals('5') // others are lte lt gt etc.
  //   .where('difficulty')
  //   .equals('easy');

  //
  ////// SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
});

exports.getToursById = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);
  // same as: Tour.findOne({ _id: req.params.id })

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }

  res.status(204).json({
    status: 'status',
    data: null,
  });
});

exports.updateTours = catchAsync(async (req, res, next) => {
  // query for the document we want to update and update
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

exports.getTourStats = catchAsync(async (req, res, next) => {
  // aggregate in the pipeline is an array of objects
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } }, //selects all that have an average rating greater that 4.5
    },
    {
      // accumulations
      $group: {
        _id: { $toUpper: '$difficulty' }, // categorises after difficulty property and makes them uppercase
        //  _id: '$maxGroupSize',, // categorises after model property
        numTours: { $sum: 1 }, // adds 1 every document and counts the total document number
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      // needs to use the new field names from above;
      $sort: {
        avgPrice: 1, // 1 = ascending; -1 = descending
      },
    },
    // {
    //   $match: { _id: { $ne: 'EASY' } }, // we can match multiple times. selects all documents that are not easy
    // },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1; // 2021

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
      // deconstruct an array field from the imput documents and then outputs 1 document for each element of the array that is startDates in our case
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' }, // adds month property
    },
    {
      $project: {
        _id: 0, // does not show id 1 makes it show up
      },
    },
    {
      $sort: { numTourStarts: -1 }, // descending order
    },
    {
      $limit: 12, // limits to 12 results
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
});
