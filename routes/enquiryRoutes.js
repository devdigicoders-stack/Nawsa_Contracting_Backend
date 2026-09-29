const express = require('express');
const router = express.Router();
const {
  createEnquiry,
  getEnquiries,
  getEnquiryById,
  updateEnquiryStatus,
  deleteEnquiry,
} = require('../controllers/enquiryController');
const { protect } = require('../middleware/authMiddleware');
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many enquiries created from this IP, please try again after 15 minutes.'
  }
});

router.route('/')
  .post(apiLimiter, createEnquiry)
  .get(protect, getEnquiries);

router.route('/:id')
  .get(protect, getEnquiryById)
  .delete(protect, deleteEnquiry);

router.patch('/:id/status', protect, updateEnquiryStatus);

module.exports = router;
