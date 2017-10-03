const sheet = document.createElement('style');

sheet.innerHTML = `
@media screen {
  #viewSourceHeader.📖-view-source-header {
    display: block !important;
  }
}
.📖-view-source-header {
  display: none;
  bottom: 0;
  left: 0;
  right: unset;
  top: unset;
  background: transparent;
  box-shadow: none;
}
`;

const segments = window.location.pathname.split('/');
let id = segments.pop();
if (id === '') id = segments.pop();

const buttons = document.createElement('div');
buttons.classList.add('📖-view-source-header');
buttons.classList.add('📖-controls');
buttons.id = 'viewSourceHeader';
buttons.innerHTML = `
  <a class="📖-btn" href="https://github.com/evnbr/bindery/tree/master/docs/examples/${id}">View Source ↗</a>
`;

document.head.appendChild(sheet);
document.body.appendChild(buttons);
