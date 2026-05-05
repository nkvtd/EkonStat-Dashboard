export function cleanParams(
    params: Record<string, unknown>,
): Record<string, unknown> {
    const cleaned: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== "") {
            cleaned[key] = value;
        }
    }

    return cleaned;
}
