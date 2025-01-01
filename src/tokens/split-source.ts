export const splitSource = (
    keep: "before" | "after", marker: string, raw: string
): [string, string] => {
    const position = raw.indexOf(marker);
    if (position == -1) {
        return keep == "before" ? [raw.trim(), ""] : ["", raw.trim()];
    }
    return [
        raw.substring(0, position).trim(),
        raw.substring(position + 1).trim()
    ];
};

