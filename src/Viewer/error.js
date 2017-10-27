/* global BINDERY_VERSION */

import h from 'hyperscript';
import { c } from '../utils';

export default function (title, text) {
  return h(c('.error'),
    h(c('.error-title'), title),
    h(c('.error-text'), text),
    h(c('.error-footer'), `Bindery ${BINDERY_VERSION}`),
  );
}
