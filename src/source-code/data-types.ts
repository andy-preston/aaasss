export type FileLineIterator =
    Generator<[SourceCode, string, number, boolean], void, unknown>;

export type FileName = string;

export type LineNumber = number;

export type SourceCode = string;
