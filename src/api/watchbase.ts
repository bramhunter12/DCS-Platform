// Mock API client for WatchBase
export const getWatchBaseData = async (query: string) => {
  console.log(`Fetching WatchBase data for: ${query}`);
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
  return {
    specs: {
      brand: 'Rolex',
      model: 'Submariner',
      reference: '126610LN',
      case_size: '41mm',
      material: 'Oystersteel',
      movement: 'Calibre 3235',
      power_reserve: '70 hours',
    },
  };
};
