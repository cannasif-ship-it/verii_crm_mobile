const SKIP_PATTERNS = [
  /key.*prop.*spread|spread.*key|key.*spread/i,
  /React keys must be passed directly/i,
  /SafeAreaView has been deprecated/i,
  /Path.*stroke|Circle.*stroke|d:.*stroke|fill:.*Path/i,
  /props object containing a .key. prop/i,
  /Reanimated.*value.*render/i,
];

function shouldSuppress(args: unknown[]): boolean {
  const msg = args.map((a) => (typeof a === "string" ? a : String(a))).join(" ");
  return SKIP_PATTERNS.some((p) => p.test(msg));
}

const originalError = console.error;
const originalWarn = console.warn;

console.error = (...args: unknown[]): void => {
  if (shouldSuppress(args)) return;
  originalError.apply(console, args);
};

console.warn = (...args: unknown[]): void => {
  if (shouldSuppress(args)) return;
  originalWarn.apply(console, args);
};
