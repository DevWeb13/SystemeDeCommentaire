/**
 * Renvoie un element HTML représentant une alerte
 *
 * @param   {string}  message
 * @param   {string}  type
 * @return  {HTMLElement}
 */
export function alertElement(message, type = 'danger') {
    /** @type {HTMLElement} */
    const el = document
        .querySelector('#alert')
        .content.firstElementChild.cloneNode(true);
    el.classList.add(`alert-${type}`);
    el.querySelector('.js-text').innerText = message;
    el.querySelector('button').addEventListener('click', (e) => {
        e.preventDefault();
        console.log(el);
        el.remove();
        el.dispatchEvent(new CustomEvent('close'));
    });
    return el;
}
