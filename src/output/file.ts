const encoder = new TextEncoder();

export const outputFile = (fileName: string, extension: string) => {
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

export type OutputFile = typeof outputFile;
export type FileWrite = ReturnType<OutputFile>["write"];
