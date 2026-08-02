async function fetchStockPrice(symbol: string) {
  const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`);
  const data = await response.json();
  return data.chart.result[0].meta.regularMarketPrice;
}

export default async function StockPrice() {
  const companies = [
    { name: "PayPal", symbol: "PYPL" },
    { name: "Singapore Airlines", symbol: "C6L.SI" },
    { name: "Adyen", symbol: "ADYEN.AS" },
    { name: "Mastercard", symbol: "MA" },
    { name: "Alibaba", symbol: "BABA" },
    { name: "Google", symbol: "GOOGL" },
    { name: "Apple", symbol: "AAPL" },
    { name: "Microsoft", symbol: "MSFT" }
  ];

  const prices = await Promise.all(
    companies.map(async (company) => ({
      name: company.name,
      price: await fetchStockPrice(company.symbol)
    }))
  );

  return (
    <div className="text-white">
      {prices.map((company) => (
        <div key={company.name}>
          {company.name} Stock Price: ${company.price}
        </div>
      ))}
    </div>
  );
}
