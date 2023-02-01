export async function fetchJSON(url, options = {}) {
    const headers = { Accept: 'application/json', ...options.headers };
    const response = await fetch(url, { ...options, headers });
    if (!response.ok) throw new Error('Erreur serveur', { cause: response });
    return await response.json();
}
