const segments = window.location.pathname.split('/');
let id = segments.pop();
if (id === '') id = segments.pop();

const btn = document.createElement('div');
btn.id = 'view-source-header';
btn.innerHTML = `
  <a class="📖-control 📖-btn" href="https://github.com/evnbr/bindery/tree/master/docs/examples/${id}/index.html">View Source ↗</a>
`;

const controls = document.querySelector('.📖-controls');
if (controls) {
  controls.appendChild(btn);
}
