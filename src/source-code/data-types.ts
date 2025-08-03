export type SourceCode = string;

type SymbolSuffix = string;

type EndOfFile = boolean;

export type FileLineIterator =
    Generator<[SourceCode, SymbolSuffix, EndOfFile], void, unknown>;

export type FileName = string;

export type LineNumber = number;

