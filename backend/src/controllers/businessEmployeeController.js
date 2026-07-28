const ApiError = require("../utils/ApiError");
const BusinessEmployee = require("../models/BusinessEmployee");
const ProviderProfile = require("../models/ProviderProfile");
const Service = require("../models/Service");
const asyncHandler = require("../utils/asyncHandler");
const escapeRegex = require("../utils/escapeRegex");
const { buildPagination, getPagination } = require("../utils/pagination");
const { isEmployeeAvailableForBooking } = require("../utils/employeeAvailability");
const pick = require("../utils/pick");
const { EMPLOYEE_STATUS } = require("../constants/businessEmployees");
const { requireBusinessProfileForUser } = require("../utils/providerAccess");

const employeeFields = [
  "name",
  "role",
  "jobTitle",
  "specializations",
  "services",
  "bio",
  "phone",
  "email",
  "profileImage",
  "profileImagePublicId",
  "availability",
  "status",
  "isBookable",
  "sortOrder",
];

const employeeServicePopulate = {
  path: "services",
  select: "name category price currency duration imageUrl isActive",
};

const buildEmployeeFilter = (businessId, query = {}) => {
  const filter = { business: businessId };
  const { isBookable, q, specialization, status } = query;

  if (status) {
    filter.status = status;
  }

  if (isBookable !== undefined) {
    filter.isBookable = isBookable;
  }

  if (specialization) {
    filter.specializations = specialization;
  }

  if (q) {
    const search = new RegExp(escapeRegex(q), "i");
    filter.$or = [
      { name: search },
      { jobTitle: search },
      { specializations: search },
      { phone: search },
      { email: search },
    ];
  }

  return filter;
};

const populateEmployeeServices = (employee) =>
  employee.populate(employeeServicePopulate);

const createBusinessEmployee = asyncHandler(async (req, res) => {
  const business = await requireBusinessProfileForUser(req.user._id);
  const values = pick(req.body, employeeFields);

  const employee = await BusinessEmployee.create({
    ...values,
    business: business._id,
  });

  await populateEmployeeServices(employee);

  res.status(201).json({
    success: true,
    data: employee,
  });
});

const listBusinessEmployees = asyncHandler(async (req, res) => {
  const business = await requireBusinessProfileForUser(req.user._id);
  const { page, limit, skip } = getPagination(req.query);
  const filter = buildEmployeeFilter(business._id, req.query);

  const [employees, total] = await Promise.all([
    BusinessEmployee.find(filter)
      .populate(employeeServicePopulate)
      .sort({ sortOrder: 1, name: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit),
    BusinessEmployee.countDocuments(filter),
  ]);

  res.json({
    success: true,
    count: employees.length,
    pagination: buildPagination({ page, limit, total }),
    data: employees,
  });
});

const getBusinessEmployeeById = asyncHandler(async (req, res) => {
  const business = await requireBusinessProfileForUser(req.user._id);
  const employee = await BusinessEmployee.findOne({
    _id: req.params.id,
    business: business._id,
  }).populate(employeeServicePopulate);

  if (!employee) {
    throw new ApiError(404, "Employee not found.");
  }

  res.json({
    success: true,
    data: employee,
  });
});

const updateBusinessEmployee = asyncHandler(async (req, res) => {
  const business = await requireBusinessProfileForUser(req.user._id);
  const updates = pick(req.body, employeeFields);

  if (!Object.keys(updates).length) {
    throw new ApiError(400, "No employee updates provided.");
  }

  const employee = await BusinessEmployee.findOne({
    _id: req.params.id,
    business: business._id,
  });

  if (!employee) {
    throw new ApiError(404, "Employee not found.");
  }

  Object.assign(employee, updates);
  await employee.save();
  await populateEmployeeServices(employee);

  res.json({
    success: true,
    data: employee,
  });
});

const deactivateBusinessEmployee = asyncHandler(async (req, res) => {
  const business = await requireBusinessProfileForUser(req.user._id);
  const employee = await BusinessEmployee.findOne({
    _id: req.params.id,
    business: business._id,
  });

  if (!employee) {
    throw new ApiError(404, "Employee not found.");
  }

  employee.status = EMPLOYEE_STATUS.INACTIVE;
  employee.isBookable = false;
  await employee.save();
  await populateEmployeeServices(employee);

  res.json({
    success: true,
    data: employee,
    message: "Employee deactivated.",
  });
});

const listPublicProviderEmployees = asyncHandler(async (req, res) => {
  const provider = await ProviderProfile.findOne({
    _id: req.params.id,
    isActive: true,
    verificationStatus: "approved",
  }).select("accountType");

  if (!provider) {
    throw new ApiError(404, "Provider not found.");
  }

  if (provider.accountType !== "business") {
    res.json({
      success: true,
      count: 0,
      data: [],
    });
    return;
  }

  const filter = {
    business: provider._id,
    isBookable: true,
    status: EMPLOYEE_STATUS.ACTIVE,
  };

  if (req.query.serviceId) {
    filter.services = req.query.serviceId;
  }

  let employees = await BusinessEmployee.find(filter)
    .populate(employeeServicePopulate)
    .sort({ sortOrder: 1, name: 1 })
    .limit(50);

  if (req.query.bookingDate && req.query.bookingTime) {
    let duration;

    if (req.query.serviceId) {
      const service = await Service.findOne({
        _id: req.query.serviceId,
        isActive: true,
        provider: provider._id,
      }).select("duration");

      duration = service?.duration;
    }

    const availabilityChecks = await Promise.all(
      employees.map(async (employee) => ({
        employee,
        isAvailable: await isEmployeeAvailableForBooking({
          bookingDate: req.query.bookingDate,
          bookingTime: req.query.bookingTime,
          duration,
          employee,
        }),
      }))
    );

    employees = availabilityChecks
      .filter((item) => item.isAvailable)
      .map((item) => item.employee);
  }

  res.json({
    success: true,
    count: employees.length,
    data: employees,
  });
});

module.exports = {
  createBusinessEmployee,
  deactivateBusinessEmployee,
  getBusinessEmployeeById,
  listBusinessEmployees,
  listPublicProviderEmployees,
  updateBusinessEmployee,
};
