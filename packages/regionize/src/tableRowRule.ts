import { ElementCloner } from './types';

const preserveTableColumns = (
  original: HTMLElement,
  clone: HTMLElement,
  nextChild: HTMLElement,
  deepClone: ElementCloner
): void => {

  const columns = [...original.children] as HTMLElement[];

  const currentIndex = columns.indexOf(nextChild);
  for (let i = 0; i < currentIndex; i += 1) {
    const origCol = columns[i];
    if (origCol) {
      const clonedCol = deepClone(origCol);
      clone.appendChild(clonedCol);  
    }
  }  
};

export default preserveTableColumns;
