import { div, button, select, option, DomAttributes } from './dom';
import { prefixer, createEl } from '../dom-utils';

const row = (children: HTMLElement[]) => createEl('row', children);

// Button
const btn = (attrs: DomAttributes, txt: string) => {
  return button(`${prefixer('control')} ${prefixer('btn')}`, attrs, txt);
}
const btnMain = (attrs: DomAttributes, txt: string) => {
  return button(`${prefixer('control')} ${prefixer('btn')} ${prefixer('btn-main')}`, attrs, txt);
}

const dropdown = (attrs: DomAttributes, options: HTMLOptionElement[]) => {
  const selectVal = createEl('select-val', []);
  selectVal.textContent = 'Value';
  const selectEl = select(prefixer('select'), attrs, options);
  const updateVal = () => {
    selectVal.textContent = selectEl.options[selectEl.selectedIndex].text;
  };
  selectEl.addEventListener('change', updateVal);
  updateVal();
  return createEl('.select-wrap.control', [selectVal, selectEl]);
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
