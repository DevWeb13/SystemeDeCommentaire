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
        this.#endpoint = element.dataset.endpoint;
        this.#template = document.querySelector(element.dataset.template);
        this.#target = document.querySelector(element.dataset.target);
        this.#elements = JSON.parse(element.dataset.elements);
        console.log(this.#target);
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
            url.searchParams.set('_page', this.#page);
            const comments = await fetchJSON(url.toString());
            if (comments.length === 0) {
                this.#observer.disconnect();
                this.#loader.remove();
                return;
            }

            for (const comment of comments) {
                const commentElement = this.#template.content.cloneNode(true);
                for (const [key, selector] of Object.entries(this.#elements)) {
                    console.log(key, selector);
                    commentElement.querySelector(selector).innerText =
                        comment[key];
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

document
    .querySelectorAll('.js-infinite-pagination')
    .forEach((element) => new InfinitePagination(element));
