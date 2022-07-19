const express = require('express');
// const tourController = require('./../controllers/tourController');
// this object will hold all controllers; same with destructuring below:
const {
  getAllTours,
  createTour,
  getToursById,
  updateTours,
  deleteTour,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
} = require('./../controllers/tourController');

const router = express.Router(); // creates a sub-app

// router.param('id', checkID);

router.route('/top-5-cheap').get(aliasTopTours, getAllTours);

router.route('/tour-stats').get(getTourStats);
router.route('/monthly-plan/:year').get(getMonthlyPlan);

router.route('/').get(getAllTours).post(createTour);

router.route('/:id').get(getToursById).patch(updateTours).delete(deleteTour);

module.exports = router;
