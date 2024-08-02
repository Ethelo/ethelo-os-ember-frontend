export function stringTransform(word, {capitalize, upperCase, capitalizeAll}) {
  if (capitalizeAll) {
    return word.split(' ')
      .map((w) => w.capitalize())
      .join(' ');
  } else if (capitalize) {
    return word.capitalize();
  } else if (upperCase) {
    return word.toUpperCase();
  } else {
    return word;
  }
}
