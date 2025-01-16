import { FileName } from "./data-types.ts";

export const fileReaderMock = () => {
    let source: Array<string> = [];

    const mockReaderMethod = (_fileName: FileName) => source;

    const addSourceCode = (text: Array<string>) => {
        source = text;
    };

    return {
        "mockReaderMethod": mockReaderMethod,
        "addSourceCode": addSourceCode
    };
};
