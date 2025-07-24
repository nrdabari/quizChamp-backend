const express = require('express');
const router = express.Router();
const { createExercise, getExercise, getExerciseData } = require('../controllers/exerciseController');

router.post('/', createExercise);

// Get all exercises
router.get('/', getExercise);

router.get('/:id', getExerciseData);

module.exports = router;
