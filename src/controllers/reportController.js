const { generateSpendingTrends } = require('../services/reportingService');
const { STATUS_CODES } = require('../constants/constants');

const getFinancialReport = async (req, res) => {
  try {
    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      category: req.query.category,
      tags: req.query.tags
    };

    const report = await generateSpendingTrends(req.user.id, filters);
    res.status(STATUS_CODES.OK).json(report);
  } catch (error) {
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

module.exports = {
  getFinancialReport
};