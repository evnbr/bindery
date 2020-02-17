import Book from './Book';
import Page from './Page';
import orderPages from './orderPages';
import annotatePages from './annotatePages';

export type PageMaker = (() => Page);

export { Book, Page, orderPages, annotatePages };
