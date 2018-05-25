import clonePath from './clonePath';

const applyRulesStub = (a, b) => {
  a.classList.add('toNext');
  b.classList.add('fromPrev');
};

test('Clone has same tagNames', () => {
  const crumb = [
    document.createElement('section'),
    document.createElement('div'),
    document.createElement('span'),
  ];

  const newCrumb = clonePath(crumb, applyRulesStub);

  expect(newCrumb.length).toBe(crumb.length);
  expect(newCrumb[0].tagName).toBe('SECTION');
  expect(newCrumb[1].tagName).toBe('DIV');
  expect(newCrumb[2].tagName).toBe('SPAN');
});

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

describe('Ordered Lists', () => {
  test('Numbering continues on next page', () => {
    const ol = document.createElement('ol');
    ol.appendChild(document.createElement('li'));
    ol.appendChild(document.createElement('li'));

    const crumb = [ol];
    const newCrumb = clonePath(crumb, applyRulesStub);

    expect(newCrumb[0].getAttribute('start')).toBe('3');
  });

  test('Numbering is one less if list element continues on next page', () => {
    const ol = document.createElement('ol');
    const li1 = document.createElement('li');
    const li2 = document.createElement('li');
    ol.appendChild(li1);
    ol.appendChild(li2);

    const crumb = [ol, li2];
    const newCrumb = clonePath(crumb, applyRulesStub);

    expect(newCrumb[0].getAttribute('start')).toBe('2');
  });

  test('Numbering starts from previous start value', () => {
    const ol = document.createElement('ol');
    ol.setAttribute('start', 5);
    ol.appendChild(document.createElement('li'));
    ol.appendChild(document.createElement('li'));

    const crumb = [ol];
    const newCrumb = clonePath(crumb, applyRulesStub);

    expect(newCrumb[0].getAttribute('start')).toBe('7');
  });
});

describe('Tables', () => {
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
    console.log(newCrumb);

    expect(newCrumb[0].childNodes.length).toBe(2);
    expect(newCrumb[0].childNodes[0].tagName).toBe('TH');
    expect(newCrumb[0].childNodes[0].firstElementChild.tagName).toBe('H3');
    expect(newCrumb[0].childNodes[0].firstElementChild.textContent).toBe('Row 1');
    expect(newCrumb[0].childNodes[1].tagName).toBe('TD');
    expect(newCrumb[1].tagName).toBe('TD');
  });
});
