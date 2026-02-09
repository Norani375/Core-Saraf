
export interface ExchangeRate {
  pair: string;
  rate: number;
  change: number;
  lastUpdate: string;
}

export const rateService = {
  fetchLiveRates: async (): Promise<ExchangeRate[]> => {
    // شبیه‌سازی فراخوانی API خارجی برای نرخ‌های ارز
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { pair: 'USD/AFN', rate: 74.20 + (Math.random() * 0.4 - 0.2), change: 0.15, lastUpdate: new Date().toLocaleTimeString('fa-AF') },
          { pair: 'EUR/AFN', rate: 80.45 + (Math.random() * 0.6 - 0.3), change: -0.05, lastUpdate: new Date().toLocaleTimeString('fa-AF') },
          { pair: 'GBP/AFN', rate: 94.10 + (Math.random() * 0.8 - 0.4), change: 0.22, lastUpdate: new Date().toLocaleTimeString('fa-AF') },
          { pair: 'PKR/AFN', rate: 0.26 + (Math.random() * 0.02 - 0.01), change: -0.12, lastUpdate: new Date().toLocaleTimeString('fa-AF') },
          { pair: 'IRR/AFN', rate: 0.0017 + (Math.random() * 0.0002 - 0.0001), change: 0.08, lastUpdate: new Date().toLocaleTimeString('fa-AF') },
        ]);
      }, 800);
    });
  }
};
