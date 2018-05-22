import clonePath from '../clonePath';

const noClasses = { toNext: [], fromPrev: [] };
const customClasses = { toNext: ['toNext'], fromPrev: ['fromPrev'] };

test('Clone has same tagNames', () => {
  const crumb = [
    document.createElement('section'),
    document.createElement('div'),
    document.createElement('span'),
  ];

  const newCrumb = clonePath(crumb, noClasses);

  expect(newCrumb.length).toBe(crumb.length);
  expect(newCrumb[0].tagName).toBe('SECTION');
  expect(newCrumb[1].tagName).toBe('DIV');
  expect(newCrumb[2].tagName).toBe('SPAN');
});

test('Split elements get classes from custom rule', () => {
  const div = document.createElement('div');
  const span = document.createElement('span');
  const crumb = [div, span];
  const newCrumb = clonePath(crumb, customClasses);

  expect(div.classList.contains('toNext')).toBe(true);
  expect(span.classList.contains('toNext')).toBe(true);
  expect(newCrumb[0].classList.contains('fromPrev')).toBe(true);
  expect(newCrumb[1].classList.contains('fromPrev')).toBe(true);
});

test('Ordered List numbering continues on next page', () => {
  const ol = document.createElement('ol');
  ol.appendChild(document.createElement('li'));
  ol.appendChild(document.createElement('li'));

  const crumb = [ol];
  const newCrumb = clonePath(crumb, customClasses);

  expect(newCrumb[0].getAttribute('start')).toBe('3');
});

test('Ordered List numbering is one less if list element continues on next page', () => {
  const ol = document.createElement('ol');
  const li1 = document.createElement('li');
  const li2 = document.createElement('li');
  ol.appendChild(li1);
  ol.appendChild(li2);

  const crumb = [ol, li2];
  const newCrumb = clonePath(crumb, customClasses);

  expect(newCrumb[0].getAttribute('start')).toBe('2');
});

test('Ordered List numbering starts from previous start value', () => {
  const ol = document.createElement('ol');
  ol.setAttribute('start', 5);
  ol.appendChild(document.createElement('li'));
  ol.appendChild(document.createElement('li'));

  const crumb = [ol];
  const newCrumb = clonePath(crumb, customClasses);

  expect(newCrumb[0].getAttribute('start')).toBe('7');
});
