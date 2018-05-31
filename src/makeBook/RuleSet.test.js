import RuleSet from './RuleSet';


describe('Split rules are called as expected', () => {
  const didSplit1 = jest.fn();
  const didSplit2 = jest.fn();
  const didSplit3 = jest.fn();

  const ruleSet = new RuleSet([
    { selector: 'div', didSplit: didSplit1 },
    { selector: '.test', didSplit: didSplit2 },
    { selector: null, didSplit: didSplit3 },
  ]);

  test('div detected', () => {
    const el = document.createElement('div');
    ruleSet.applySplitRules(el, null, null, null);
    expect(didSplit1).toBeCalledWith(el, null, null, null);
    expect(didSplit2).not.toBeCalled();
    expect(didSplit3).not.toBeCalled();
  });

  test('two rules detected', () => {
    const el = document.createElement('div');
    el.classList.add('test');
    ruleSet.applySplitRules(el, null, null, null);
    expect(didSplit1).toBeCalledWith(el, null, null, null);
    expect(didSplit2).toBeCalledWith(el, null, null, null);
    expect(didSplit3).not.toBeCalled();
  });
});

describe('After add rules are called as expected', () => {
  const replacedEl = document.createElement('div');
  const replacedAgainEl = document.createElement('div');
  const afterAdd1 = jest.fn();
  const afterAdd2 = jest.fn();
  afterAdd1.mockReturnValue(replacedEl);
  afterAdd2.mockReturnValue(replacedAgainEl);

  const ruleSet = new RuleSet([
    { selector: 'div', afterAdd: afterAdd1 },
    { selector: '.test', afterAdd: afterAdd2 },
  ]);

  test('div detected', () => {
    const el = document.createElement('div');
    const newEl = ruleSet.applyAfterAddRules(el, null, null, null);
    expect(afterAdd1).toBeCalledWith(el, null, null, null, expect.any(Function));
    expect(afterAdd2).not.toBeCalled();
    expect(newEl).toBe(replacedEl);
  });

  test('two replacements', () => {
    const el = document.createElement('div');
    el.classList.add('test');
    const newEl = ruleSet.applyAfterAddRules(el, null, null, null);
    expect(afterAdd1).toBeCalledWith(el, null, null, null, expect.any(Function));
    expect(afterAdd2).toBeCalledWith(replacedEl, null, null, null, expect.any(Function));
    expect(newEl).toBe(replacedAgainEl);
  });
});

describe('Before add rules are called as expected', () => {
  const replacedEl = document.createElement('div');
  const replacedAgainEl = document.createElement('div');
  const beforeAdd1 = jest.fn();
  const beforeAdd2 = jest.fn();
  beforeAdd1.mockReturnValue(replacedEl);
  beforeAdd2.mockReturnValue(replacedAgainEl);

  const ruleSet = new RuleSet([
    { selector: 'div', beforeAdd: beforeAdd1 },
    { selector: '.test', beforeAdd: beforeAdd2 },
  ]);

  test('div detected', () => {
    const el = document.createElement('div');
    const newEl = ruleSet.applyBeforeAddRules(el, null, null, null);
    expect(beforeAdd1).toBeCalledWith(el, null, null, null);
    expect(beforeAdd2).not.toBeCalled();
    expect(newEl).toBe(replacedEl);
  });

  test('two replacements', () => {
    const el = document.createElement('div');
    el.classList.add('test');
    const newEl = ruleSet.applyBeforeAddRules(el, null, null, null);
    expect(beforeAdd1).toBeCalledWith(el, null, null, null);
    expect(beforeAdd2).toBeCalledWith(replacedEl, null, null, null);
    expect(newEl).toBe(replacedAgainEl);
  });
});

describe('Page rules are called as expected', () => {
  const eachPage1 = jest.fn();
  const eachPage2 = jest.fn();
  const pageRule1 = { eachPage: eachPage1 };
  const pageRule2 = { eachPage: eachPage2 };

  const ruleSet = new RuleSet([pageRule1, pageRule2]);

  test('eachpage', () => {
    const page = {};
    const book = { pages: [] };
    ruleSet.applyPageDoneRules(page, book);
    expect(eachPage1).toBeCalledWith(page, book);
    expect(eachPage2).toBeCalledWith(page, book);
  });

  test('finishEveryPage', () => {
    const page1 = { number: 1 };
    const page2 = { number: 2 };
    const page3 = { number: 3 };
    const book = { pages: [page1, page2, page3] };
    const pageNot = { number: 0 };

    ruleSet.finishEveryPage(book);
    expect(eachPage1).toBeCalledWith(page1, book);
    expect(eachPage1).toBeCalledWith(page2, book);
    expect(eachPage1).toBeCalledWith(page3, book);
    expect(eachPage1).not.toBeCalledWith(pageNot, book);
    expect(eachPage2).toBeCalledWith(page1, book);
    expect(eachPage2).toBeCalledWith(page2, book);
    expect(eachPage2).toBeCalledWith(page3, book);
    expect(eachPage2).not.toBeCalledWith(pageNot, book);
  });
});
