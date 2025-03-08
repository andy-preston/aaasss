export const numberBag = (it: number) =>
    ({ "type": "number" as const, "it": it });
export type NumberBag = ReturnType<typeof numberBag>;

export const stringBag = (it: string) =>
    ({ "type": "string" as const, "it": it });
export type StringBag = ReturnType<typeof stringBag>;

export const emptyBag = () => stringBag("");

export const stringsBag = (it: Array<string>) =>
    ({ "type": "strings" as const, "it": it });
export type StringsBag = ReturnType<typeof stringsBag>;

export const booleanBag = (it: boolean) =>
    ({ "type": "boolean" as const, "it": it });
export type BooleanBag = ReturnType<typeof booleanBag>;
