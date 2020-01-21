import c from './prefixer';
import createEl from './createEl';

const safeMeasure = (el: HTMLElement, measure) => {
  if (el.parentNode) return measure();
  let measureArea = document.querySelector(c('.measure-area'));
  if (!measureArea) measureArea = document.body.appendChild(createEl('measure-area'));
  if (measureArea.firstElementChild !== el) {
    measureArea.innerHTML = '';
    measureArea.appendChild(el);
  }
  const result = measure();
  return result;
};

export default safeMeasure;
