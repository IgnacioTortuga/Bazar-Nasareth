export function businessEntries(value, fallbackLabels) {
  return (value || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const separator = line.indexOf('|');
      return separator >= 0
        ? {
            label: line.slice(0, separator).trim(),
            value: line.slice(separator + 1).trim(),
          }
        : { label: fallbackLabels[index] || `Local ${index + 1}`, value: line };
    });
}
