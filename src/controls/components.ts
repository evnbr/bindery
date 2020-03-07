import { div, button, select, option, DomAttributes } from '../dom';

const row = (cls: string | null, ...children: (HTMLElement | string)[]) => {
  return div(`${cls}.row`, ...children);
};

// Button
const btn = (cls: string | null, attrs: DomAttributes, label: string) => {
  return button(`.control.btn${cls}`, attrs, label);
};

const dropdown = (attrs: DomAttributes, options: HTMLOptionElement[]) => {
  const selectVal = div('.select-val', 'Value');
  const selectEl = select('.select', attrs, ...options);
  selectVal.textContent = selectEl.options[selectEl.selectedIndex].text;
  return div('.select-wrap.control', selectVal, selectEl);
};

interface Stringable {
  toString: () => string;
}

const enumDropdown = <ChoiceType extends Stringable>(
  entries: [ChoiceType, string][],
  initialValue: ChoiceType,
  changeHandler: (a: ChoiceType) => any,
): HTMLElement => {
  const eventHandler = (e: Event) => {
    const rawVal = (e.target as HTMLSelectElement).value;
    const chosenEntry = entries.filter(
      entry => entry[0].toString() === rawVal,
    )[0];
    if (chosenEntry) {
      changeHandler(chosenEntry[0]);
    } else {
      throw Error('Selected unknown value');
    }
  };

  return dropdown(
    { onchange: eventHandler },
    entries.map(entry => {
      const el = option({ value: entry[0] }, entry[1]);
      if (entry[0] === initialValue) {
        el.selected = true;
      }
      return el;
    }),
  );
};

export { row, btn, dropdown, option, div, enumDropdown };
