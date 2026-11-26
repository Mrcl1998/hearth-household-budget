// Hearth Budget — bootstrap: render the routed view now, re-render on every
// hash change, and re-draw the canvas charts after a resize.
import { render } from './views.js';

render();
window.addEventListener('hashchange', render);
let resizeTimer = null;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(render, 200);
});
