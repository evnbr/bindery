const SPACE = ' ';

const nextWordEnd = (text: string, startIndex: number): number => {
  let newIndex = startIndex + 1;
  while (newIndex < text.length && text.charAt(newIndex) !== SPACE) {
    newIndex += 1;
  }
  return newIndex;
}

const previousWordEnd = (text: string, startIndex: number): number => {
  let newIndex = startIndex;
  if (text.charAt(newIndex) === SPACE) {
    newIndex -= 1;
  }
  while (text.charAt(newIndex) !== SPACE && newIndex > 0) {
    newIndex -= 1;
  }
  return newIndex;
}

export { nextWordEnd, previousWordEnd };