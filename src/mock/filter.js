const FILTERS = [
  `all`, `overdue`, `today`, `favorites`, `repeating`, `archive`
];

const generateFilters = () => {
  return FILTERS.map((it) => {
    return {
      name: it,
      count: Math.floor(Math.random() * 10),
    };
  });
};


export {generateFilters};
