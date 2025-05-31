export const lowByte = (word: number) => word & 0xff;
export const highByte = (word: number) => (word >> 8) & 0xff;
export const complement = (byte: number) => byte < 0 ? 0x0100 + byte : byte;
