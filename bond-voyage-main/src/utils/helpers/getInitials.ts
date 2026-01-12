export const getInitials = (word: string) => {
  if (!word) return "BV";

  const words = word.split(" ");
  if (words && words.length >= 2) {
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  }
  return word.substring(0, 2).toUpperCase();
};
