import scheduler from '../Scheduler';
import shouldIgnoreOverflow from './shouldIgnoreOverflow';
import Thenable from './Thenable';

// Try adding a text node in one go
const addTextNode = (textNode, parent, page) => new Thenable((resolve, reject) => {
  parent.appendChild(textNode);

  if (page.hasOverflowed()) {
    parent.removeChild(textNode);
    scheduler.throttle(reject);
  } else {
    scheduler.throttle(resolve);
  }
});

// Try adding a text node by incrementally adding words
// until it just barely doesnt overflow.
// Binary search would probably be better but its not currenty
// the bottleneck.
const addTextNodeIncremental = (textNode, parent, page) => new Thenable((resolve, reject) => {
  const originalText = textNode.nodeValue;
  parent.appendChild(textNode);

  if (!page.hasOverflowed() || shouldIgnoreOverflow(parent)) {
    scheduler.throttle(resolve);
    return;
  }

  let pos = 0;

  const splitTextStep = () => {
    textNode.nodeValue = originalText.substr(0, pos);

    if (page.hasOverflowed()) {
      // Back out to word boundary
      if (originalText.charAt(pos) === ' ') pos -= 1; // TODO: redundant
      while (originalText.charAt(pos) !== ' ' && pos > 0) pos -= 1;

      if (pos < 1) {
        textNode.nodeValue = originalText;
        textNode.parentNode.removeChild(textNode);
        scheduler.throttle(reject);
        return;
      }

      // console.log(`Text breaks at ${pos}: ${originalText.substr(0, pos)}`);

      const fittingText = originalText.substr(0, pos);
      const overflowingText = originalText.substr(pos);
      textNode.nodeValue = fittingText;

      // Start on new page
      const remainingTextNode = document.createTextNode(overflowingText);
      scheduler.throttle(() => resolve(remainingTextNode));
      return;
    }
    if (pos > originalText.length - 1) {
      scheduler.throttle(resolve);
      return;
    }

    pos += 1;
    while (originalText.charAt(pos) !== ' ' && pos < originalText.length) pos += 1;

    scheduler.throttle(splitTextStep);
  };

  splitTextStep();
});

export { addTextNode, addTextNodeIncremental };
