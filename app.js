import { alertElement } from './functions/alert.js';
import { fetchJSON } from './functions/api.js';

class InfinitePagination {
    /** @type {string} */
    #endpoint;
    /** @type {HTMLTemplateElement} */
    #template;
    /** @type {HTMLElement} */
    #target;
    /** @type {HTMLElement} */
    #loader;
    /** @type {object} */
    #elements;
    /** @type {IntersectionObserver} */
    #observer;
    /** @type {boolean} */
    #loading = false;
    /** @type {number} */
    #page = 1;

    /**
     * @param   {HTMLElement}  element  [element description]
     */
    constructor(element) {
        this.#loader = element;
        this.#endpoint = element.dataset.endpoint || '';
        this.#template =
            document.querySelector(element.dataset.template || '') ||
            document.createElement('template');
        this.#target =
            document.querySelector(element.dataset.target || '') ||
            document.createElement('div');
        this.#elements = JSON.parse(element.dataset.elements || '{}');
        this.#observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    this.#loadMore();
                }
            });
        });
        this.#observer.observe(element);
    }

    async #loadMore() {
        if (this.#loading) return;
        this.#loading = true;
        try {
            const url = new URL(this.#endpoint);
            url.searchParams.set('_page', this.#page.toString());
            const comments = await fetchJSON(url.toString());
            if (comments.length === 0) {
                this.#observer.disconnect();
                this.#loader.remove();
                return;
            }

            for (const comment of comments) {
                const commentElement = this.#template.content.cloneNode(true);
                if (commentElement instanceof DocumentFragment) {
                    for (const [key, selector] of Object.entries(
                        this.#elements,
                    )) {
                        console.log(key, selector);
                        commentElement.querySelector(selector).innerText =
                            comment[key];
                    }
                }
                this.#target.append(commentElement);
            }
            this.#page++;
            this.#loading = false;
        } catch (e) {
            this.#loader.style.display = 'none';
            const error = alertElement('Impossible de charger les contenus');
            error.addEventListener('close', () => {
                this.#loader.style.removeProperty('display');
                this.#loading = false;
            });
            this.#target.append(error);
        }
    }
}

class FetchForm {
    /** @type {string} */
    #endpoint;
    /** @type {HTMLTemplateElement} */
    #template;
    /** @type {HTMLElement} */
    #target;
    /** @type {object} */
    #elements;

    /**
     * @param   {HTMLFormElement}  form
     */
    constructor(form) {
        this.#endpoint = form.dataset.endpoint || '';
        this.#template =
            document.querySelector(form.dataset.template || '') ||
            document.createElement('template');
        this.#target =
            document.querySelector(form.dataset.target || '') ||
            document.createElement('div');
        this.#elements = JSON.parse(form.dataset.elements || '{}');
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            if (event.currentTarget instanceof HTMLFormElement) {
                this.#submitForm(event.currentTarget);
            }
        });
    }

    /**
     * @param   {HTMLFormElement}  form
     */
    async #submitForm(form) {
        const button = form.querySelector('button');
        button?.setAttribute('disabled', '');
        try {
            const formData = new FormData(form);
            const comment = await fetchJSON(this.#endpoint, {
                method: 'POST',
                json: Object.fromEntries(formData),
            });
            const commentElement = this.#template.content.cloneNode(true);
            if (commentElement instanceof DocumentFragment) {
                for (const [key, selector] of Object.entries(this.#elements)) {
                    console.log(key, selector);
                    commentElement.querySelector(selector).innerText =
                        comment[key];
                }
            }
            this.#target.prepend(commentElement);
            form.reset();
            const successElement = alertElement(
                'Merci pour votre commentaire',
                'success',
            );
            form.insertAdjacentElement('beforebegin', successElement);
            successElement.addEventListener('close', () => {
                button?.removeAttribute('disabled');
            });
        } catch (e) {
            const errorElement = alertElement(
                "Impossible d'envoyer le message",
            );
            form.insertAdjacentElement('beforebegin', errorElement);
            errorElement.addEventListener('close', () => {
                button?.removeAttribute('disabled');
            });
        }
    }
}

document.querySelectorAll('.js-infinite-pagination').forEach((element) => {
    if (element instanceof HTMLElement) {
        new InfinitePagination(element);
    }
});

document.querySelectorAll('.js-form-fetch').forEach((form) => {
    if (form instanceof HTMLFormElement) {
        new FetchForm(form);
    }
});
