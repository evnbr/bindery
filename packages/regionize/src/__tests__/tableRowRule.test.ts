import clonePath from '../clonePath';
import tableRowRule from '../tableRowRule';

const applyRulesStub = (orig: any, clone: any, next: any, deepClone: any) => {
  tableRowRule(orig, clone, next, deepClone);
};

test('Cloned row copies first column', async () => {
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

  const _th = newCrumb[0].childNodes[0] as any;
  const _td = newCrumb[0].childNodes[1] as any;
  expect(newCrumb[0].childNodes.length).toBe(2);
  expect(_th.tagName).toBe('TH');
  expect(_th.firstElementChild!.tagName).toBe('H3');
  expect(_th.firstElementChild!.textContent).toBe('Row 1');
  expect(_td.tagName).toBe('TD');
  expect(newCrumb[1]).toBe(_td);
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

  const _th = newCrumb[0].childNodes[0] as any;
  const _td = newCrumb[0].childNodes[1] as any;
  const _td2 = newCrumb[0].childNodes[2] as any;
  const _td3 = newCrumb[0].childNodes[3] as any;
  expect(newCrumb[0].childNodes.length).toBe(4);
  expect(_th.tagName).toBe('TH');
  expect(_th.textContent).toBe('id');
  expect(_td.tagName).toBe('TD');
  expect(_td.textContent).toBe('first');
  expect(_td2.tagName).toBe('TD');
  expect(_td2.textContent).toBe('middle');
  expect(_td3.tagName).toBe('TD');

  // 3rd column overflowed, so would not have content
  expect(_td3.textContent).toBe('');
  expect(newCrumb[1]).toBe(_td3);
});
