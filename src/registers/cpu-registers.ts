export const cpuRegisters = () => {
    const registers: Map<string, number> = new Map();

    const initialise = (reducedCore: boolean) => {
        let register = reducedCore ? 16 : 0;
        while (register < 32) {
            registers.set(`R${register}`, register++);
        }
        const specialRegisters: Array<[string, number]> = [
            ["XL", 26],
            ["XH", 27],
            ["YL", 28],
            ["YH", 29],
            ["ZL", 30],
            ["ZH", 31],
        ];
        for (const [name, value] of specialRegisters) {
            registers.set(name, value);
        }
    };

    return {
        "initialise": initialise,
        "has": (symbolName: string) => registers.has(symbolName),
        "value": (symbolName: string) => registers.get(symbolName)!
    };
};

export type CpuRegisters = Readonly<ReturnType<typeof cpuRegisters>>;
