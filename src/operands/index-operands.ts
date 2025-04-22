export const indexOperands = [
    "X", "X-", "X+", "+X", "-X",
    "Y", "Y-", "Y+", "+Y", "-Y",
    "Z", "Z-", "Z+", "+Z", "-Z"
] as const;

export type IndexOperand = typeof indexOperands[number];
