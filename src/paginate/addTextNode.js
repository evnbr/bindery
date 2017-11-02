import scheduler from '../Scheduler';
import shouldIgnoreOverflow from './shouldIgnoreOverflow';

// Try adding a text node in one go
const addTextNode = (textNode, parent, page, success) => {
  parent.appendChild(textNode);

  if (page.hasOverflowed()) {
    parent.removeChild(textNode);
    scheduler.throttle(() => success(false));
  } else {
    scheduler.throttle(() => success(true));
  }
};

// Try adding a text node by incrementally adding words
// until it just barely doesnt overflow.
// Binary search would probably be better but its not currenty
// the bottleneck.
const addTextNodeIncremental = (textNode, parent, page) => {
  let callbackArgs = null;
  let doneCallback = null;

  const success = function (...args) {
    callbackArgs = args;
    if (doneCallback !== null) doneCallback(callbackArgs);
  };

  const synchronousThenable = {
    then: (func) => {
      doneCallback = func;
      if (callbackArgs !== null) doneCallback(callbackArgs);
    },
  };

  const originalText = textNode.nodeValue;
  parent.appendChild(textNode);

  if (!page.hasOverflowed() || shouldIgnoreOverflow(parent)) {
    scheduler.throttle(() => success(true));
    return synchronousThenable;
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
        scheduler.throttle(() => success(false));
        return;
      }

      // console.log(`Text breaks at ${pos}: ${originalText.substr(0, pos)}`);

      const fittingText = originalText.substr(0, pos);
      const overflowingText = originalText.substr(pos);
      textNode.nodeValue = fittingText;

      // Start on new page
      const remainingTextNode = document.createTextNode(overflowingText);
      scheduler.throttle(() => success(true, remainingTextNode));
      return;
    }
    if (pos > originalText.length - 1) {
      scheduler.throttle(success);
      return;
    }

    pos += 1;
    while (originalText.charAt(pos) !== ' ' && pos < originalText.length) pos += 1;

    scheduler.throttle(splitTextStep);
  };

  splitTextStep();
  return synchronousThenable;
};

export { addTextNode, addTextNodeIncremental };
