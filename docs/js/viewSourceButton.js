const sheet = document.createElement('style');

sheet.innerHTML = `
@media screen {
  #view-source-header {
    display: block !important;
  }
}
#view-source-header {
  display: none;
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  z-index: 999;
}

#view-source-header a {
  font: 12px/1.5 -apple-system, BlinkMacSystemFont, "Roboto", sans-serif;
  color: white;
  text-decoration: none;
  padding: 0.5rem 0.8rem;
  border-radius: 3px;
  background: rgba(0,0,0,0.7);
}

#view-source-header a:hover {
  background: rgba(0,0,0,0.8);
}

`;

const segments = window.location.pathname.split('/');
let id = segments.pop();
if (id === '') id = segments.pop();

const buttons = document.createElement('div');
buttons.id = 'view-source-header';
buttons.innerHTML = `
  <a href="https://github.com/evnbr/bindery/tree/master/docs/examples/${id}">View Source ↗</a>
`;

document.head.appendChild(sheet);
document.body.appendChild(buttons);
