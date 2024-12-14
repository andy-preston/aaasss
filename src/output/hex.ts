import { LineWithObjectCode } from "../object-code/line-types.ts";
import type { FileWrite } from "./file.ts";
import { hexBuffer } from "./hex-buffer.ts";
import { hexRecord } from "./hex-record.ts";

const programMemoryAddressInBytes = (programMemoryAddress: number): number =>
    programMemoryAddress * 2;

export const hexFile = () => {
    const dataRecords: Array<string> = [];
    const buffer = hexBuffer();

    const line = (line: LineWithObjectCode) => {
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

    const save = (write: FileWrite) => {
        saveRecordsFromByteBuffer(1);
        write(":020000020000FC");
        dataRecords.forEach(write);
        write(":00000001FF");
    };

    return {
        "line": line,
        "save": save
    };
}

export type HexFile = ReturnType<typeof hexFile>;
