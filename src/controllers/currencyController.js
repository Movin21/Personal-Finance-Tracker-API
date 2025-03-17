const CurrencyService = require('../services/currencyService');
const User = require('../models/userModel');
const { STATUS_CODES } = require('../constants/constants');

/**
 * Get latest exchange rates for a base currency
 * @route GET /api/currency/rates/:baseCurrency
 * @access Public
 */
const getExchangeRates = async (req, res) => {
  try {
    const { baseCurrency = 'USD' } = req.params;
    const rates = await CurrencyService.getLatestRates(baseCurrency.toUpperCase());
    res.status(STATUS_CODES.OK).json(rates);
  } catch (error) {
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

/**
 * Convert an amount from one currency to another
 * @route POST /api/currency/convert
 * @access Public
 */
const convertCurrency = async (req, res) => {
  try {
    const { amount, fromCurrency, toCurrency, date } = req.body;
    
    if (!amount || !fromCurrency || !toCurrency) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ 
        message: 'Amount, fromCurrency, and toCurrency are required' 
      });
    }
    
    const convertedAmount = await CurrencyService.convertCurrency(
      amount, 
      fromCurrency.toUpperCase(), 
      toCurrency.toUpperCase(),
      date ? new Date(date) : new Date()
    );
    
    res.status(STATUS_CODES.OK).json({
      originalAmount: amount,
      originalCurrency: fromCurrency.toUpperCase(),
      convertedAmount,
      targetCurrency: toCurrency.toUpperCase(),
      exchangeRate: convertedAmount / amount,
      date: date ? new Date(date) : new Date()
    });
  } catch (error) {
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

/**
 * Update user's preferred currency
 * @route PUT /api/currency/preference
 * @access Private
 */
const updatePreferredCurrency = async (req, res) => {
  try {
    const { preferredCurrency } = req.body;
    
    if (!preferredCurrency) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ 
        message: 'Preferred currency is required' 
      });
    }
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { preferredCurrency: preferredCurrency.toUpperCase() },
      { new: true }
    );
    
    if (!user) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ message: 'User not found' });
    }
    
    res.status(STATUS_CODES.OK).json({
      message: 'Preferred currency updated successfully',
      preferredCurrency: user.preferredCurrency
    });
  } catch (error) {
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

/**
 * Get user's preferred currency
 * @route GET /api/currency/preference
 * @access Private
 */
const getPreferredCurrency = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ message: 'User not found' });
    }
    
    res.status(STATUS_CODES.OK).json({
      preferredCurrency: user.preferredCurrency
    });
  } catch (error) {
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

/**
 * Force refresh of exchange rates
 * @route POST /api/currency/refresh/:baseCurrency
 * @access Admin
 */
const refreshExchangeRates = async (req, res) => {
  try {
    const { baseCurrency = 'USD' } = req.params;
    const rates = await CurrencyService.fetchAndStoreRates(baseCurrency.toUpperCase());
    res.status(STATUS_CODES.OK).json({
      message: 'Exchange rates refreshed successfully',
      rates
    });
  } catch (error) {
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

module.exports = {
  getExchangeRates,
  convertCurrency,
  updatePreferredCurrency,
  getPreferredCurrency,
  refreshExchangeRates
};