// Slug al estilo de GitHub: minúsculas, sin signos de puntuación y con guiones en lugar de espacios
// ("## Mi Sección" -> "mi-sección")
export function slugify(text: string) {
    return text.trim().toLowerCase().replace(/[^\p{L}\p{M}\p{N}\p{Pc}\- ]/gu, "").replace(/ /g, "-");
}

// Sin tildes: así `#mi-seccion` también encuentra "Mi sección"
const looseSlug = (slug: string) => slug.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

// Busca el destino de un enlace interno (`#fragmento`) dentro del preview.
// Se calcula al hacer clic: no cuesta nada mientras se escribe y funciona aunque el preview esté troceado.
export function findAnchorTarget(root: HTMLElement, fragment: string): HTMLElement | null {
    let target = fragment;
    try {
        target = decodeURIComponent(fragment);
    } catch {
        // Fragmento mal codificado: se busca tal cual
    }
    if (!target) return null;

    // Anclas escritas a mano en HTML (<a id="...">; las <a name="..."> se renderizan también con id)
    const explicit = root.querySelector<HTMLElement>(`[id="${CSS.escape(target)}"]`);
    if (explicit) return explicit;

    // Encabezados en orden: los títulos repetidos llevan -1, -2... como en GitHub
    const seen = new Map<string, number>();
    const headings: { slug: string; element: HTMLElement }[] = [];
    for (const element of root.querySelectorAll<HTMLElement>("h1, h2, h3, h4, h5, h6")) {
        const base = slugify(element.textContent ?? "");
        const count = seen.get(base) ?? 0;
        seen.set(base, count + 1);
        headings.push({ slug: count ? `${base}-${count}` : base, element });
    }

    const wanted = target.toLowerCase();
    return headings.find(({ slug }) => slug === wanted)?.element
        ?? headings.find(({ slug }) => looseSlug(slug) === looseSlug(wanted))?.element
        ?? null;
}
