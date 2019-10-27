/* global BINDERY_VERSION */

import { createEl } from '../dom-utils';

export default function (title, text) {
  return createEl('.error', [
    createEl('.error-title', title),
    createEl('.error-text', text),
    createEl('.error-footer', `Bindery ${BINDERY_VERSION}`),
  ]);
}
