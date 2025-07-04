
// Map display text to backend format
export const levelMap = {
  'PreSchool (4-6 years)': 'Pre_Junior',
  'Junior (7 & above years)': 'Junior',
};

// Map backend format to display text
export const displayLevelMap = {
  'Pre_Junior': 'PreSchool (4-6 years)',
  'Junior': 'Junior (7 & above years)',
};

// Converts display level to backend level (e.g., for payment API, Redux)
export const getBackendLevel = (displayLevel) => {
  if (!displayLevel) return 'null';

  // Normalize all dash-like characters to regular hyphen (-)
  const normalized = displayLevel.replace(/[–—]/g, '-');

  return levelMap[normalized] || levelMap[displayLevel] || displayLevel;
};


// Converts backend level to display level (e.g., for UI labels)
export const getDisplayLevel = (backendLevel) => {
  return displayLevelMap[backendLevel] || backendLevel;
};
