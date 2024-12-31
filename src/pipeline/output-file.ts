export const outputFile = (fileName: string, extension: string) => {
    const encoder = new TextEncoder();
    const theFile = Deno.openSync(
        fileName.substring(0, fileName.lastIndexOf(".")) + extension,
        { create: true, write: true, truncate: true }
    );
    const write = (text: string) => {
        theFile.writeSync(encoder.encode(`${text}\n`));
    };
    const close = () => {
        theFile.close();
    };
    return {
        "write": write,
        "close": close
    };
};

export type OutputFileFactory = typeof outputFile;
export type OutputFile = ReturnType<OutputFileFactory>;

