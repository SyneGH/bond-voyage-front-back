export const capitalize = (word: string) => {
  if (!word || word.length === 0) return "";

  return `${word[0].toUpperCase()}${word.slice(1, word.length).toLowerCase()}`;
};
