const Enquiry = require('../models/Enquiry');

// @desc    Create an enquiry
// @route   POST /api/enquiries
// @access  Public
const createEnquiry = async (req, res, next) => {
  try {
    let { fullName, companyName, phone, email, facilityType, serviceRequired, location, preferredContactMethod, message } = req.body;

    // Trim all input
    fullName = fullName?.trim();
    companyName = companyName?.trim();
    phone = phone?.trim();
    email = email?.trim();
    facilityType = facilityType?.trim();
    serviceRequired = serviceRequired?.trim();
    location = location?.trim();
    preferredContactMethod = preferredContactMethod?.trim();
    message = message?.trim();

    // Validation
    if (!fullName || !phone || !email || !facilityType || !serviceRequired || !message) {
      res.status(400);
      return res.json({
        success: false,
        message: 'Please provide all required fields.',
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400);
      return res.json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    if (message.length > 2000) {
      res.status(400);
      return res.json({
        success: false,
        message: 'Message is too long. Maximum allowed length is 2000 characters.',
      });
    }

    const enquiry = new Enquiry({
      fullName,
      companyName,
      phone,
      email,
      facilityType,
      serviceRequired,
      location,
      preferredContactMethod,
      message,
    });

    const createdEnquiry = await enquiry.save();
    
    res.status(201).json({
      success: true,
      message: 'Your enquiry has been submitted successfully.',
      data: createdEnquiry,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all enquiries
// @route   GET /api/enquiries
// @access  Private
const getEnquiries = async (req, res, next) => {
  try {
    const { search, status, serviceRequired, page, limit, sort } = req.query;
    
    let query = {};
    
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
      ];
    }
    
    if (status) query.status = status;
    if (serviceRequired) query.serviceRequired = serviceRequired;

    const pageNumber = Number(page) || 1;
    const pageSize = Number(limit) || 10;
    
    let sortObj = { createdAt: -1 };
    if (sort === 'oldest') sortObj = { createdAt: 1 };
    
    const count = await Enquiry.countDocuments(query);
    const enquiries = await Enquiry.find(query)
      .sort(sortObj)
      .skip(pageSize * (pageNumber - 1))
      .limit(pageSize);

    res.json({
      success: true,
      data: enquiries,
      page: pageNumber,
      pages: Math.ceil(count / pageSize),
      total: count,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get enquiry by ID
// @route   GET /api/enquiries/:id
// @access  Private
const getEnquiryById = async (req, res, next) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id);

    if (enquiry) {
      res.json({
        success: true,
        data: enquiry,
      });
    } else {
      res.status(404);
      throw new Error('Enquiry not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update enquiry status
// @route   PATCH /api/enquiries/:id/status
// @access  Private
const updateEnquiryStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const enquiry = await Enquiry.findById(req.params.id);

    if (enquiry) {
      enquiry.status = status;
      const updatedEnquiry = await enquiry.save();
      
      res.json({
        success: true,
        data: updatedEnquiry,
      });
    } else {
      res.status(404);
      throw new Error('Enquiry not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an enquiry
// @route   DELETE /api/enquiries/:id
// @access  Private
const deleteEnquiry = async (req, res, next) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id);

    if (enquiry) {
      await enquiry.deleteOne();
      res.json({
        success: true,
        message: 'Enquiry removed',
      });
    } else {
      res.status(404);
      throw new Error('Enquiry not found');
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createEnquiry,
  getEnquiries,
  getEnquiryById,
  updateEnquiryStatus,
  deleteEnquiry,
};
