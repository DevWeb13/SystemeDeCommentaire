/**
 * It fetches a JSON resource and returns a promise that resolves to the JSON object
 * @param {string} url - The URL to fetch.
 * @param {RequestInit & {json?: object}} options
 * @returns The response from the server.
 */
export async function fetchJSON(url, options = {}) {
    const headers = { Accept: 'application/json', ...options.headers };
    if (options.json) {
        options.body = JSON.stringify(options.json);
        headers['Content-Type'] = 'application/json';
    }
    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
        const error = new Error('Erreur serveur');
        Object.assign(error, { cause: response });
        throw error;
    }
    return await response.json();
}
