import { DOUBLE_MS } from './model.ts';

type Tap = { x: number; y: number; time: number };
type Scheduler = { later: (fn: () => void, delay: number) => unknown; cancel: (timer: unknown) => void };
const scheduler: Scheduler = {
  later: (fn, delay) => setTimeout(fn, delay),
  cancel: timer => clearTimeout(timer as ReturnType<typeof setTimeout>),
};

/** The first tap waits so a second tap can create a point without zooming first. */
export function createMapTaps<T>(single: (value: T) => void, double: (value: T) => void, clock: Scheduler = scheduler) {
  let previous: Tap | null = null;
  let timer: unknown = null;
  const cancel = () => {
    if (timer !== null) clock.cancel(timer);
    timer = null;
    previous = null;
  };
  return {
    cancel,
    tap(position: Tap, value: T) {
      const second = previous && position.time - previous.time <= DOUBLE_MS && Math.hypot(previous.x - position.x, previous.y - position.y) <= 32;
      cancel();
      if (second) { double(value); return; }
      previous = position;
      timer = clock.later(() => { timer = null; previous = null; single(value); }, DOUBLE_MS);
    },
  };
}
