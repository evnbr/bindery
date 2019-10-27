import clonePath from '../clonePath';
import orderedListRule from '../orderedListRule';

const applyRulesStub = (orig: any, clone: any, next: any) => {
  orderedListRule(orig, clone, next);
};

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
    ol.setAttribute('start', '5');
    ol.appendChild(document.createElement('li'));
    ol.appendChild(document.createElement('li'));

    const crumb = [ol];
    const newCrumb = clonePath(crumb, applyRulesStub);

    expect(newCrumb[0].getAttribute('start')).toBe('7');
  });
});
