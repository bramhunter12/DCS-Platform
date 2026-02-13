// Mock API client for eBay
export const getEbayData = async (query: string) => {
  console.log(`Fetching eBay data for: ${query}`);
  await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay
  return {
    recent_sales: [
      { id: 1, title: 'Rolex Submariner 126610LN', price: '$14,800', date: '2026-02-10' },
      { id: 2, title: 'Rolex Submariner Date 126610LN', price: '$15,200', date: '2026-02-08' },
      { id: 3, title: 'New Rolex Submariner 126610LN', price: '$15,500', date: '2026-02-05' },
    ],
  };
};
