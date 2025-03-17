const mongoose = require("mongoose");

const currencyRateSchema = new mongoose.Schema(
  {
    base: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    rates: {
      type: Map,
      of: Number,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

// Method to get exchange rate between two currencies
currencyRateSchema.statics.getExchangeRate = async function (fromCurrency, toCurrency, date = new Date()) {
  // If currencies are the same, return 1
  if (fromCurrency === toCurrency) return 1;
  
  // Find the closest rate entry to the given date
  const rateEntry = await this.findOne({
    date: { $lte: date },
  }).sort({ date: -1 }).limit(1);
  
  if (!rateEntry) {
    throw new Error(`No exchange rates available for ${fromCurrency} to ${toCurrency}`);
  }
  
  // If base currency is the fromCurrency
  if (rateEntry.base === fromCurrency) {
    const rate = rateEntry.rates.get(toCurrency);
    if (!rate) {
      throw new Error(`Exchange rate not available for ${toCurrency}`);
    }
    return rate;
  }
  
  // If base currency is the toCurrency
  if (rateEntry.base === toCurrency) {
    const rate = rateEntry.rates.get(fromCurrency);
    if (!rate) {
      throw new Error(`Exchange rate not available for ${fromCurrency}`);
    }
    return 1 / rate;
  }
  
  // If neither currency is the base, convert through the base
  const fromRate = rateEntry.rates.get(fromCurrency);
  const toRate = rateEntry.rates.get(toCurrency);
  
  if (!fromRate || !toRate) {
    throw new Error(`Exchange rate not available for ${fromCurrency} to ${toCurrency}`);
  }
  
  // Convert from source to base, then from base to target
  return toRate / fromRate;
};

// Method to convert an amount between currencies
currencyRateSchema.statics.convert = async function (amount, fromCurrency, toCurrency, date = new Date()) {
  const rate = await this.getExchangeRate(fromCurrency, toCurrency, date);
  return amount * rate;
};

module.exports = mongoose.model("CurrencyRate", currencyRateSchema);