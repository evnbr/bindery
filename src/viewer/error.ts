/* global BINDERY_VERSION */

import { createEl } from '../dom-utils';

declare const BINDERY_VERSION: string;

export default function (title: string, text: string) {
  return createEl('.error', [
    createEl('.error-title', title),
    createEl('.error-text', text),
    createEl('.error-footer', `Bindery ${BINDERY_VERSION}`),
  ]);
}
