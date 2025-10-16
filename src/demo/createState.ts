export type Selector<T, S> = (state: T) => S;
export type Subscriber<S> = (state: S, prevState: S | undefined) => void;

export type State<T> = {
  getState: () => T;
  setState: (newState: Partial<T>) => void;
  /**
   * 상태 변경을 구독합니다.
   * @param callback 상태가 변경될 때 호출될 함수
   * @param selector 특정 상태 조각을 선택하는 함수. 제공될 경우, 해당 조각이 변경될 때만 콜백이 호출됩니다.
   * @param equalityFn 이전 값과 현재 값을 비교하는 함수. 기본값은 Object.is 입니다.
   */
  subscribe: <S>(
    callback: Subscriber<S>,
    selector?: Selector<T, S>,
    equalityFn?: (a: S, b: S) => boolean
  ) => () => void;
};

/**
 * 간단한 상태 저장소를 생성합니다.
 * 상태가 변경되면 모든 구독자에게 알립니다.
 * @param initialState 초기 상태 객체
 * @returns 상태 관리 API
 */
export function createState<T extends object>(initialState: T): State<T> {
  let state: T = { ...initialState };
  // 각 구독자는 (이전 상태, 현재 상태)를 받아 동작하도록 구성합니다.
  const subscribers: Set<(oldState: T, newState: T) => void> = new Set();

  // 상태 조회: 개발 환경에서는 변경 방지를 위해 동결된 스냅샷을 반환합니다.
  const getState = () => {
    const snapshot = { ...state } as T;
    if (process.env.NODE_ENV !== "production") {
      return Object.freeze(snapshot);
    }
    return snapshot;
  };

  // 배치 업데이트 제어
  let isUpdateScheduled = false;
  let batchStartState: T | null = null;

  const processUpdates = () => {
    if (!isUpdateScheduled) return;
    const oldState = batchStartState ?? state;
    const newState = state;

    // 모든 구독자에게 변경 알림(이전/현재 상태 전달)
    subscribers.forEach((notify) => notify(oldState, newState));

    // 배치 리셋
    batchStartState = null;
    isUpdateScheduled = false;
  };

  const setState = (newPartial: Partial<T>) => {
    // 배치 시작 시점의 상태를 저장
    if (!isUpdateScheduled) {
      batchStartState = state;
      isUpdateScheduled = true;
      // 마이크로태스크에서 알림을 일괄 처리
      Promise.resolve().then(processUpdates);
    }

    // 상태는 즉시 갱신하여 getState()가 최신 값을 반환하도록 함
    state = { ...state, ...newPartial } as T;
  };

  const subscribe = <S>(
    callback: Subscriber<S>,
    selector: Selector<T, S> = (s) => s as unknown as S,
    equalityFn: (a: S, b: S) => boolean = Object.is
  ) => {
    // 구독 시점의 선택 상태를 기준으로 이전 값 초기화
    let lastSelectedState: S = selector(state);

    const notify = (oldState: T, newState: T) => {
      const prevSelected = selector(oldState);
      const nextSelected = selector(newState);

      // 선택된 값이 동일하면 콜백 생략
      if (equalityFn(prevSelected, nextSelected)) {
        return;
      }

      lastSelectedState = nextSelected;
      callback(nextSelected, prevSelected);
    };

    subscribers.add(notify);
    // 구독 취소 함수를 반환
    return () => subscribers.delete(notify);
  };

  return { getState, setState, subscribe };
}
