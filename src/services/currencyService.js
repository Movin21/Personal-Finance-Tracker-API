const axios = require('axios');
const mongoose = require('mongoose');
const CurrencyRate = require('../models/currencyModel');

// You would need to sign up for a free API key from a service like ExchangeRate-API or similar
// For this implementation, we'll use a placeholder API_KEY that should be replaced with a real one
const API_KEY = process.env.EXCHANGE_RATE_API_KEY || 'your_api_key_here';
const BASE_URL = 'https://api.exchangerate-api.com/v4/latest/';

class CurrencyService {
  /**
   * Fetch latest exchange rates from the API and store in database
   * @param {string} baseCurrency - Base currency code (e.g., 'USD')
   * @returns {Promise<Object>} - The saved currency rate document
   */
  static async fetchAndStoreRates(baseCurrency = 'USD') {
    try {
      // Fetch the latest rates from the API
      const response = await axios.get(`${BASE_URL}${baseCurrency}?api_key=${API_KEY}`);
      
      if (response.status !== 200) {
        throw new Error(`Failed to fetch exchange rates: ${response.statusText}`);
      }
      
      const { rates, date } = response.data;
      
      // Create a new currency rate document
      const currencyRate = new CurrencyRate({
        base: baseCurrency,
        rates: rates,
        date: new Date(date || Date.now())
      });
      
      // Save to database
      await currencyRate.save();
      
      console.log(`Exchange rates updated for ${baseCurrency} on ${new Date().toISOString()}`);
      return currencyRate;
    } catch (error) {
      console.error('Error updating exchange rates:', error.message);
      throw error;
    }
  }

  /**
   * Get the latest exchange rates for a base currency
   * @param {string} baseCurrency - Base currency code
   * @returns {Promise<Object>} - The latest rates
   */
  static async getLatestRates(baseCurrency = 'USD') {
    try {
      const latestRates = await CurrencyRate.findOne({ base: baseCurrency })
        .sort({ date: -1 })
        .limit(1);
      
      if (!latestRates) {
        // If no rates found in DB, fetch from API
        return await this.fetchAndStoreRates(baseCurrency);
      }
      
      // Check if rates are older than 24 hours
      const rateAge = Date.now() - latestRates.date.getTime();
      const oneDayMs = 24 * 60 * 60 * 1000;
      
      if (rateAge > oneDayMs) {
        // Rates are older than 24 hours, fetch new ones
        return await this.fetchAndStoreRates(baseCurrency);
      }
      
      return latestRates;
    } catch (error) {
      console.error('Error getting latest rates:', error.message);
      throw error;
    }
  }

  /**
   * Convert amount from one currency to another
   * @param {number} amount - Amount to convert
   * @param {string} fromCurrency - Source currency code
   * @param {string} toCurrency - Target currency code
   * @param {Date} date - Date for historical conversion (optional)
   * @returns {Promise<number>} - Converted amount
   */
  static async convertCurrency(amount, fromCurrency, toCurrency, date = new Date()) {
    try {
      return await CurrencyRate.convert(amount, fromCurrency, toCurrency, date);
    } catch (error) {
      console.error('Error converting currency:', error.message);
      throw error;
    }
  }

  /**
   * Get exchange rate between two currencies
   * @param {string} fromCurrency - Source currency code
   * @param {string} toCurrency - Target currency code
   * @param {Date} date - Date for historical rate (optional)
   * @returns {Promise<number>} - Exchange rate
   */
  static async getExchangeRate(fromCurrency, toCurrency, date = new Date()) {
    try {
      return await CurrencyRate.getExchangeRate(fromCurrency, toCurrency, date);
    } catch (error) {
      console.error('Error getting exchange rate:', error.message);
      throw error;
    }
  }

  /**
   * Initialize the currency service by fetching initial rates
   * for common base currencies
   */
  static async initialize() {
    try {
      const commonCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD'];
      
      for (const currency of commonCurrencies) {
        // Check if we already have recent rates for this currency
        const existingRates = await CurrencyRate.findOne({ base: currency })
          .sort({ date: -1 })
          .limit(1);
        
        if (!existingRates || (Date.now() - existingRates.date.getTime() > 24 * 60 * 60 * 1000)) {
          await this.fetchAndStoreRates(currency);
        }
      }
      
      console.log('Currency service initialized with latest rates');
    } catch (error) {
      console.error('Failed to initialize currency service:', error.message);
    }
  }
}

module.exports = CurrencyService;