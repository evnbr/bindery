/* global BINDERY_VERSION */

import { div } from '../dom';

declare const BINDERY_VERSION: string;

export default function (title: string, text: string) {
  return div('.error',
    div('.error-title', title),
    div('.error-text', text),
    div('.error-footer', `Bindery ${BINDERY_VERSION}`),
  );
}
