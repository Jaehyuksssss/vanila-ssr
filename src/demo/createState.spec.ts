import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { createState } from "./createState";

type TestState = {
  count: number;
  text: string;
  user?: { name: string };
};

const getInitialState = (): TestState => ({
  count: 0,
  text: "hello",
});

describe("createState", () => {
  let originalNodeEnv: string | undefined;

  beforeEach(() => {
    originalNodeEnv = process.env.NODE_ENV;
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
    vi.useRealTimers();
  });

  it("should return the initial state", () => {
    const store = createState(getInitialState());
    expect(store.getState()).toEqual(getInitialState());
  });

  it("should update state with setState", () => {
    const store = createState(getInitialState());
    store.setState({ count: 5 });
    expect(store.getState().count).toBe(5);
    expect(store.getState().text).toBe("hello");
  });

  it("should notify subscribers on state change", async () => {
    const store = createState(getInitialState());
    const subscriber = vi.fn();

    store.subscribe(subscriber);

    store.setState({ count: 1 });

    // Wait for the batched update
    await Promise.resolve();

    expect(subscriber).toHaveBeenCalledTimes(1);
    expect(subscriber).toHaveBeenCalledWith(
      { count: 1, text: "hello" },
      { count: 0, text: "hello" }
    );
  });

  it("should batch multiple setState calls", async () => {
    const store = createState(getInitialState());
    const subscriber = vi.fn();
    store.subscribe(subscriber);

    store.setState({ count: 1 });
    store.setState({ text: "world" });
    store.setState({ count: 2 });

    await Promise.resolve();

    expect(subscriber).toHaveBeenCalledTimes(1);
    expect(subscriber).toHaveBeenCalledWith(
      { count: 2, text: "world" },
      { count: 0, text: "hello" }
    );
    expect(store.getState()).toEqual({ count: 2, text: "world" });
  });

  it("should allow unsubscribing", async () => {
    const store = createState(getInitialState());
    const subscriber = vi.fn();

    const unsubscribe = store.subscribe(subscriber);
    unsubscribe();

    store.setState({ count: 1 });
    await Promise.resolve();

    expect(subscriber).not.toHaveBeenCalled();
  });

  it("should prevent direct state mutation in development", () => {
    process.env.NODE_ENV = "development";
    const store = createState(getInitialState());
    const state = store.getState();

    // This should throw an error because the state object is frozen
    expect(() => {
      (state as any).count = 100;
    }).toThrow();
  });

  it("should not prevent direct state mutation in production", () => {
    process.env.NODE_ENV = "production";
    const store = createState(getInitialState());
    const state = store.getState();

    // This should not throw in production for performance reasons
    expect(() => {
      (state as any).count = 100;
    }).not.toThrow();
    // Note: this mutation does not trigger subscribers, which is why it's bad practice.
    expect(store.getState().count).toBe(0);
  });

  describe("with selectors", () => {
    it("should only notify when selected state changes", async () => {
      const store = createState(getInitialState());
      const countSubscriber = vi.fn();

      store.subscribe(countSubscriber, (state) => state.count);

      // This should trigger the subscriber
      store.setState({ count: 1 });
      await Promise.resolve();
      expect(countSubscriber).toHaveBeenCalledTimes(1);
      expect(countSubscriber).toHaveBeenCalledWith(1, 0);

      // This should NOT trigger the subscriber
      store.setState({ text: "world" });
      await Promise.resolve();
      expect(countSubscriber).toHaveBeenCalledTimes(1);
    });

    it("should use equalityFn to compare states", async () => {
      const store = createState({ user: { name: "John" } });
      const subscriber = vi.fn();

      // Subscribe to the user object, but only notify if the name changes
      store.subscribe(
        subscriber,
        (state) => state.user,
        (a, b) => a?.name === b?.name
      );

      // This should NOT trigger a notification because the name is the same
      store.setState({ user: { name: "John" } });
      await Promise.resolve();
      expect(subscriber).not.toHaveBeenCalled();

      // This should trigger a notification
      store.setState({ user: { name: "Jane" } });
      await Promise.resolve();
      expect(subscriber).toHaveBeenCalledTimes(1);
      expect(subscriber).toHaveBeenCalledWith(
        { name: "Jane" },
        { name: "John" }
      );
    });

    it("should provide previous initial state on first call", async () => {
      const store = createState(getInitialState());
      const subscriber = vi.fn();

      store.subscribe(subscriber, (state) => state.count);

      // Initial state is 0, but no notification yet.
      // Trigger first notification
      store.setState({ count: 1 });
      await Promise.resolve();

      expect(subscriber).toHaveBeenCalledTimes(1);
      // The first call's `prevState` should be the initial state value.
      // But our implementation tracks the *last notified* state.
      // Let's re-verify the implementation.
      // The callback is only called if `lastSelectedState` is different.
      // `lastSelectedState` is only set *after* the callback.
      // So on the first run, `lastSelectedState` is undefined.
      // Let's test this behavior.

      const anotherStore = createState({ count: 10 });
      const anotherSub = vi.fn();
      anotherStore.subscribe(anotherSub, (s) => s.count);

      // Trigger first notification
      anotherStore.setState({ count: 11 });
      await Promise.resolve();
      expect(anotherSub).toHaveBeenCalledWith(11, 10);
    });
  });
});
