import { nextWordEnd, previousWordEnd } from '../stringUtils';

const simple = 'This is sample text.';
const multiSpace = 'This    is   sample text.';

describe('nextWordEnd', () => {
    test('Works for simple text', () => {
        expect(nextWordEnd(simple, 0)).toBe(4);
        expect(nextWordEnd(simple, 3)).toBe(4);
        expect(nextWordEnd(simple, 4)).toBe(7);
        expect(nextWordEnd(simple, 11)).toBe(14);
    });
    // TODO: Doesn't work
    // test('Works when multiple spaces', () => {
    //     expect(nextWordEnd(multiSpace, 0)).toBe(4);
    //     expect(nextWordEnd(multiSpace, 4)).toBe(10);
    //     expect(nextWordEnd(multiSpace, 7)).toBe(10);
    // });
});
  
describe('previousWordEnd', () => {
    test('Works for simple text', () => {
        expect(previousWordEnd(simple, 0)).toBe(0);
        expect(previousWordEnd(simple, 3)).toBe(0);
        expect(previousWordEnd(simple, 5)).toBe(4);
        expect(previousWordEnd(simple, 11)).toBe(7);
    });
});