/**
 * Before/after comparison slider.
 * Markup contract: [data-compare] > input[type=range][data-compare-input].
 * The input drives the `--pos` CSS variable (0-100), so pointer, touch and
 * keyboard (arrows, Home/End) all work natively and stay screen-reader friendly.
 */
export function initCompareSliders(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>('[data-compare]').forEach((el) => {
    const input = el.querySelector<HTMLInputElement>('[data-compare-input]');
    if (!input) return;
    const update = () => {
      el.style.setProperty('--pos', `${input.value}%`);
      input.setAttribute('aria-valuetext', `Mostrando ${input.value}% de la imagen del antes`);
    };
    input.addEventListener('input', update);
    update();
  });
}
