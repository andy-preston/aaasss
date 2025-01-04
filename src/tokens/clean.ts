const anyWhitespace = /\s+/g;
const comment = /;.*$/;

export const clean = (sourceLine: string) =>
    sourceLine.replace(comment, "").replace(anyWhitespace, " ").trim();
