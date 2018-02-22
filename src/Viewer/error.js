/* global BINDERY_VERSION */

import { el } from '../utils';

export default function (title, text) {
  return el('.error', [
    el('.error-title', title),
    el('.error-text', text),
    el('.error-footer', `Bindery ${BINDERY_VERSION}`),
  ]);
}
