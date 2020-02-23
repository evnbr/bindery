import c from './prefixer';
import { div } from './dom';

const safeMeasure = (el: HTMLElement, measureCallback: () => any) => {
  if (el.parentNode) return measureCallback();
  let measureArea = document.querySelector(c('.measure-area'));
  if (!measureArea) measureArea = document.body.appendChild(div('.measure-area'));
  if (measureArea.firstElementChild !== el) {
    measureArea.innerHTML = '';
    measureArea.appendChild(el);
  }
  const result = measureCallback();
  return result;
};

export default safeMeasure;
