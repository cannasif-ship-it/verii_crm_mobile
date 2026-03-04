const identity = (value) => value;
const noop = () => {};

const easing = {
  linear: identity,
  ease: identity,
  in: identity,
  out: identity,
  inOut: identity,
  bezier: () => identity,
};

const animationIdentity = (value) => value;

const Reanimated = {
  createAnimatedComponent: (Component) => Component,
  useSharedValue: (initialValue) => ({ value: initialValue }),
  useDerivedValue: (factory) => ({ value: typeof factory === "function" ? factory() : factory }),
  useAnimatedStyle: (factory) => (typeof factory === "function" ? factory() : {}),
  useAnimatedProps: (factory) => (typeof factory === "function" ? factory() : {}),
  useAnimatedGestureHandler: () => noop,
  useAnimatedScrollHandler: () => noop,
  useAnimatedRef: () => ({ current: null }),
  runOnJS: (fn) => fn,
  runOnUI: (fn) => fn,
  withTiming: animationIdentity,
  withSpring: animationIdentity,
  withDelay: (_delay, value) => value,
  withRepeat: (value) => value,
  withSequence: (...values) => (values.length ? values[values.length - 1] : undefined),
  cancelAnimation: noop,
  makeMutable: (initialValue) => ({ value: initialValue }),
  Easing: easing,
};

module.exports = Reanimated;
module.exports.default = Reanimated;
