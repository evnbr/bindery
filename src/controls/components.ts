import { div, button, select, option, DomAttributes } from './dom';
import { prefixer } from '../dom-utils';

const row = (cls: string | null, ...children: HTMLElement[]) => {
  return div(`${cls} ${prefixer('row')}`, ...children);
}

// Button
const btn = (attrs: DomAttributes, label: string) => {
  return button(`${prefixer('control')} ${prefixer('btn')}`, attrs, label);
}
const btnMain = (attrs: DomAttributes, label: string) => {
  return button(`${prefixer('control')} ${prefixer('btn')} ${prefixer('btn-main')}`, attrs, label);
}

const dropdown = (attrs: DomAttributes, options: HTMLOptionElement[]) => {
  const selectVal = div('select-val', 'Value');
  selectVal.textContent = 'Value';
  const selectEl = select(prefixer('select'), attrs, ...options);
  const updateVal = () => {
    selectVal.textContent = selectEl.options[selectEl.selectedIndex].text;
  };
  selectEl.addEventListener('change', updateVal);
  updateVal();
  return div(`${prefixer('select-wrap')} ${prefixer('control')}`, selectVal, selectEl);
};

interface Stringable {
  toString: () => string
}

const enumDropdown = <ChoiceType extends Stringable>(
    entries: [ChoiceType, string][],
    initialValue: ChoiceType,
    changeHandler: ((a: ChoiceType) => any)
  ): HTMLElement => {

    const eventHandler = (e: Event) => {
      const rawVal = (e.target as HTMLSelectElement).value;
      const chosenEntry = entries.filter(entry => entry[0].toString() === rawVal)[0];
      if (chosenEntry) {
        changeHandler(chosenEntry[0]);
      } else {
        throw Error('Selected unknown value');
      }
    };

    return dropdown(
      { onchange: eventHandler },
      entries.map((entry) => {
        const el = option({value: entry[0]}, entry[1]);
        if (entry[0] === initialValue) {
          el.selected = true;
        }
        return el;
      })
    );
}

export {
  row,
  btn,
  btnMain,
  dropdown,
  option,
  div,
  enumDropdown,
};
