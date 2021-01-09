import type { BookContent } from '../types';
import { parseHTML } from '../dom';

const fetchContent = async (url: string, selector?: string): Promise<HTMLElement> => {
  const response = await fetch(url);
  if (response.status !== 200) {
    throw Error(`Response ${response.status}: Could not load file at "${url}"`);
  }
  const fetchedContent = await response.text();
  const el = parseHTML(fetchedContent, selector);
  if (!(el instanceof HTMLElement)) {
    throw Error(
      `Could not find element that matches selector "${selector}" in response from ${url}`,
    );
  }
  return el;
};

export const getContentAsElement = async (content: BookContent): Promise<HTMLElement> => {
  if (content instanceof HTMLElement) return content;
  if (typeof content === 'string') {
    const el = document.querySelector(content);
    if (!(el instanceof HTMLElement)) {
      throw Error(`Could not find element that matches selector "${content}"`);
    }
    return el as HTMLElement;
  }
  if (typeof content === 'object' && content.url) {
    return fetchContent(content.url, content.selector);
  }
  throw Error('Content source must be an element or selector');
};
