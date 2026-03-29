const enabled =
  process.env.NO_COLOR === undefined && process.env.FORCE_COLOR !== "0";

const fmt = (code) => (str) => (enabled ? `\x1b[${code}m${str}\x1b[0m` : str);

export const bold = fmt("1");
export const dim = fmt("2");
export const red = fmt("31");
export const green = fmt("32");
export const cyan = fmt("36");
