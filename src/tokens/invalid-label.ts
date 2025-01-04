const validLabel = /^\w*$/;

export const invalidLabel = (label: string) => !validLabel.test(label);
