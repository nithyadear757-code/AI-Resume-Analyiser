const express = require('express');
const {
  createLeave,
  getLeaves,
  getLeaveById,
  updateLeave,
  deleteLeave,
} = require('../controllers/leaveController');

const router = express.Router();

router.route('/').post(createLeave).get(getLeaves);
router.route('/:id').get(getLeaveById).put(updateLeave).delete(deleteLeave);

module.exports = router;
