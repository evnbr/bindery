const sheet = document.createElement('style');

sheet.innerHTML = `
@media screen {
  #viewSourceHeader.📖-view-source-header {
    display: block !important;
  }
}
.📖-view-source-header {
  display: none;
  top: 0;
  left: 0;
  right: unset;
  bottom: unset;
  padding: 1em;
  background: transparent;
  box-shadow: none;
}
.📖-logo {
  width: 32px;
  height: 32px;
  background: url(http://evanbrooks.info/bindery/assets/logo.svg) no-repeat;
  background-size: contain;
  vertical-align: middle;
  margin-right: 0.8rem;
  display: inline-block;
}
`;

const buttons = document.createElement('div');
buttons.classList.add('📖-view-source-header');
buttons.classList.add('📖-controls');
buttons.id = 'viewSourceHeader';
buttons.innerHTML = `
  <a href="/bindery/"><div class="📖-logo"></div></a>
  <a class="📖-btn" href="https://github.com/evnbr/bindery/tree/master/docs/examples/">View Source ↗</a>
`;


document.body.appendChild(buttons);
document.head.appendChild(sheet);
