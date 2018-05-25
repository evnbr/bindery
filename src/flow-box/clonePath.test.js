import clonePath from './clonePath';

test('Clone has same tagNames', () => {
  const crumb = [
    document.createElement('section'),
    document.createElement('div'),
    document.createElement('span'),
  ];

  const newCrumb = clonePath(crumb, () => {});

  expect(newCrumb.length).toBe(crumb.length);
  expect(newCrumb[0].tagName).toBe('SECTION');
  expect(newCrumb[1].tagName).toBe('DIV');
  expect(newCrumb[2].tagName).toBe('SPAN');
});

const applyRulesStub = (a, b) => {
  a.classList.add('toNext');
  b.classList.add('fromPrev');
};

test('Split elements get classes from custom rule', () => {
  const div = document.createElement('div');
  const span = document.createElement('span');
  const crumb = [div, span];
  const newCrumb = clonePath(crumb, applyRulesStub);

  expect(div.classList.contains('toNext')).toBe(true);
  expect(span.classList.contains('toNext')).toBe(true);
  expect(newCrumb[0].classList.contains('fromPrev')).toBe(true);
  expect(newCrumb[1].classList.contains('fromPrev')).toBe(true);
});
