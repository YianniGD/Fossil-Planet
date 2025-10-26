export const getInitialData = async () => {
  const response = await fetch('/new_prehistoric_data/data/species_index_full.json');
  if (!response.ok) {
    throw new Error('Failed to fetch prehistoric data');
  }
  const speciesData = await response.json();

  const eras = [...new Set(speciesData.flatMap(s => s.eras))];
  const epochs = [...new Set(speciesData.map(s => s.epoch))];
  const categories = [...new Set(speciesData.flatMap(s => s.categories.map(c => c.primary)))];

  return { 
    speciesData,
    eras,
    epochs,
    categories
  };
};