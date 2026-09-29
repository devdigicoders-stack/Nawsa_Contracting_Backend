const Enquiry = require('../models/Enquiry');

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res, next) => {
  try {
    const totalEnquiries = await Enquiry.countDocuments();
    const newEnquiries = await Enquiry.countDocuments({ status: 'New' });
    const contactedEnquiries = await Enquiry.countDocuments({ status: 'Contacted' });
    const closedEnquiries = await Enquiry.countDocuments({ status: 'Closed' });
    
    const recentEnquiries = await Enquiry.find().sort({ createdAt: -1 }).limit(5);

    res.json({
      success: true,
      data: {
        totalEnquiries,
        newEnquiries,
        contactedEnquiries,
        closedEnquiries,
        recentEnquiries,
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
};
