import React, { useState, useEffect } from 'react';

const CurrencyExchangeRatesPage = () => {
  const [rates, setRates] = useState([]);

  useEffect(() => {
    // Mock-up data for currency exchange rates
    const mockRates = {
      USD: 1.0,
      EUR: 0.85,
      GBP: 0.75,
      JPY: 110.0,
      AUD: 1.35
    };
    setRates(mockRates);
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Currency Exchange Rates</h1>
      <ul className="list-disc pl-5">
        {Object.entries(rates).map(([currency, rate]) => (
          <li key={currency} className="mb-2">
            <span className="font-medium">{currency}:</span> {rate}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CurrencyExchangeRatesPage;
