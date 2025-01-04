export const returnIfExpression = (trimmedJs: string): string => {
    // This is both "magic" and "clever", so it could well turn out to
    // be a massive annoyance and have to be removed.
    const singleLine = trimmedJs.match(/\n/) == null;
    const noSemicolons = trimmedJs.match(/;/) == null;
    const noAssignments = trimmedJs.match(/[^!><=]=[^=]/) == null;
    const noExplicitReturn = trimmedJs.match(/^return/) == null;
    return singleLine && noSemicolons && noAssignments && noExplicitReturn
        ? `return ${trimmedJs}`
        : trimmedJs;
};
