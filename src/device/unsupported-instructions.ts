import type { Mnemonic } from "../source-files/line.ts";

export const unsupportedInstructions = () => {
    let instructions: Array<Mnemonic> = [];

    // There's little point in adding types to the group keys because, at run
    // time, they'll come from JSON.
    const groups: Map<string, Array<Mnemonic>> = new Map([
        ["multiply", ["MUL", "MULS", "MULSU", "FMUL", "FMULS", "FMULSU"]],
        ["readModifyWrite", ["LAC", "LAS", "LAT", "XCH"]],
        ["DES", ["DES"]],
        ["FlashMore128", ["EICALL", "EIJMP"]],
        ["FlashMore8", ["CALL", "JMP"]],
        // We need to understand this better to explain WHY some devices have
        // SPM but not SPM.Z
        ["SPM.Z", ["SPM.Z"]],
        // ELPM needs more study!
        ["ELPM", ["ELPM", "ELPM.Z"]]
    ]);

    const choose = (unsupportedGroups: Array<string>) => {
        instructions = unsupportedGroups.flatMap((group) => {
            if (!groups.has(group)) {
                throw new Error(
                    `Unknown unsupported instruction group: ${group}`
                );
            }
            return groups.get(group)!;
        });
    };

    const isUnsupported = (mnemonic: Mnemonic) =>
        instructions.includes(mnemonic);

    return {
        "choose": choose,
        "isUnsupported": isUnsupported
    };
};
