import type { OutputFileFactory } from "../pipeline/output-file.ts";
import type { LineWithObjectCode } from "../object-code/line-types.ts";
import type { FileName } from "../source-code/data-types.ts";
import { hexBuffer } from "./hex-buffer.ts";
import { hexRecord } from "./hex-record.ts";

const programMemoryAddressInBytes = (programMemoryAddress: number): number =>
    programMemoryAddress * 2;

export const hexFile = (outputFile: OutputFileFactory, topFileName: FileName) => {
    const dataRecords: Array<string> = [];
    const buffer = hexBuffer();
    let noHexFile: boolean = false;

    const line = (line: LineWithObjectCode) => {
        if (line.failed()) {
            noHexFile = true;
        }
        const newAddress = programMemoryAddressInBytes(line.address);
        if (!buffer.isContinuous(newAddress)) {
            saveRecordsFromByteBuffer(1);
            buffer.restartAt(newAddress);
        }
        for (const block of line.code) {
            buffer.add(block);
        }
        if (buffer.hasAtLeast(16)) {
            saveRecordsFromByteBuffer(16);
        }
    };

    const saveRecordsFromByteBuffer = (minimumRecordSize: 1 | 16) => {
        while (buffer.hasAtLeast(minimumRecordSize)) {
            const record = hexRecord(buffer.address());
            buffer.pairs().forEach(record.add);
            dataRecords.push(record.asString());
        }
    };

    const save = () => {
        if (noHexFile) {
            return;
        }
        saveRecordsFromByteBuffer(1);
        const file = outputFile(topFileName, '.hex');
        file.write(":020000020000FC");
        dataRecords.forEach(file.write);
        file.write(":00000001FF");
        file.close();
    };

    return {
        "line": line,
        "save": save
    };
}

export type HexFile = ReturnType<typeof hexFile>;
