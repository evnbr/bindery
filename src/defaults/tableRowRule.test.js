import clonePath from '../regionize/clonePath';
import tableRowRule from './tableRowRule';

const applyRulesStub = (orig, clone, next, deepClone) => {
  tableRowRule.didSplit(orig, clone, next, deepClone);
};

test('Cloned row copies first column', () => {
  const tr = document.createElement('tr');
  const th = document.createElement('th');
  const h3 = document.createElement('h3');
  const td = document.createElement('td');
  h3.textContent = 'Row 1';
  th.appendChild(h3);
  tr.appendChild(th);
  tr.appendChild(td);

  const crumb = [tr, td];
  const newCrumb = clonePath(crumb, applyRulesStub);

  expect(newCrumb[0].childNodes.length).toBe(2);
  expect(newCrumb[0].childNodes[0].tagName).toBe('TH');
  expect(newCrumb[0].childNodes[0].firstElementChild.tagName).toBe('H3');
  expect(newCrumb[0].childNodes[0].firstElementChild.textContent).toBe('Row 1');
  expect(newCrumb[0].childNodes[1].tagName).toBe('TD');
  expect(newCrumb[1]).toBe(newCrumb[0].childNodes[1]);
});

test('Cloned row copies first three column', () => {
  const tr = document.createElement('tr');
  const th = document.createElement('th');
  const td1 = document.createElement('td');
  const td2 = document.createElement('td');
  const td3 = document.createElement('td');
  th.textContent = 'id';
  td1.textContent = 'first';
  td2.textContent = 'middle';
  td3.textContent = 'last';

  tr.appendChild(th);
  tr.appendChild(td1);
  tr.appendChild(td2);
  tr.appendChild(td3);

  const crumb = [tr, td3];
  const newCrumb = clonePath(crumb, applyRulesStub);

  expect(newCrumb[0].childNodes.length).toBe(4);
  expect(newCrumb[0].childNodes[0].tagName).toBe('TH');
  expect(newCrumb[0].childNodes[0].textContent).toBe('id');
  expect(newCrumb[0].childNodes[1].tagName).toBe('TD');
  expect(newCrumb[0].childNodes[1].textContent).toBe('first');
  expect(newCrumb[0].childNodes[2].tagName).toBe('TD');
  expect(newCrumb[0].childNodes[2].textContent).toBe('middle');
  expect(newCrumb[0].childNodes[3].tagName).toBe('TD');

  // 3rd column overflowed, so would not have content
  expect(newCrumb[0].childNodes[3].textContent).toBe('');
  expect(newCrumb[1]).toBe(newCrumb[0].childNodes[3]);
});
