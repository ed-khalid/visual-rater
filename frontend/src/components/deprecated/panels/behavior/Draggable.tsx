import { useRef, useState, useEffect, useCallback } from "react";
import { Position } from "../../../../models/Position";

// call `f` no more frequently than once a frame
export const throttle = (f:(...args:any[]) => void) => {
  let token:number|null = null,
    lastArgs:any[] = [];
  const invoke = () => {
    f(...lastArgs);
    token = null;
  };
  const result = (...args:any[]) => {
    lastArgs = args;
    if (!token) {
      token = requestAnimationFrame(invoke);
    }
  };
  result.cancel = () => token && cancelAnimationFrame(token);
  return result;
};


// subscribe an action to be done on an element
// useRefEffect: (handler: () => (void | (() => void))) => void
export const useRefEffect = (handler:any)   => {
  const storedValue = useRef<any>();
  const unsubscribe = useRef<any>();
  const result = useCallback(
    (value:any) => {
      storedValue.current = value;
      if (unsubscribe.current) {
        unsubscribe.current();
        unsubscribe.current = undefined;
      }
      if (value) {
        unsubscribe.current = handler(value);
      }
    },
    [handler]
  );
  useEffect(() => {
    result(storedValue.current);
  }, [result]);
  return result;
};

// combine several `ref`s into one
// list of refs is supposed to be immutable after first render
const useCombinedRef = (...refs:any[]) => {
  const initialRefs = useRef(refs);
  return useCallback((value:any) => {
    initialRefs.current.forEach((ref) => {
      if (typeof ref === "function") {
        ref(value);
      } else {
        ref.current = value;
      }
    });
  }, []);
};

// create a ref to subscribe to given element's event
const useDomEvent = (name:string, handler:any) => {
  return useCallback(
    (elem:Element) => {
      elem.addEventListener(name, handler);
      return () => {
        elem.removeEventListener(name, handler);
      };
    },
    [name, handler]
  );
};


// returns [ref]
// position doesn't update while dragging
export const useDraggable =  () : [(value:any) => void] => {
  const [pressed, setPressed] = useState(false);
  const [initialPosition, setInitialPosition] = useState<Position>({ x: Infinity, y: Infinity });
  const ref = useRef<HTMLDivElement>();
  const handleMouseDown = useCallback((e:MouseEvent) => {
    if (e.button !== 0) {
      return;
    }
    setPressed(true);
  }, []);

  useEffect(() => {
    if (ref.current) {
      const refPosition = {x : ref.current.getBoundingClientRect().x, y: ref.current.getBoundingClientRect().y }
      setInitialPosition(refPosition)
    }
  }, [ref])
  useEffect(() => {
    if (!ref.current) return;
    const elem = ref.current;
    elem.style.userSelect = "none";
    return () => {
      elem.style.userSelect = "auto";
    };
  }, []);
  const subscribeMouseDown = useDomEvent("pointerdown", handleMouseDown);
  const ref2 = useRefEffect(subscribeMouseDown);
  const combinedRef = useCombinedRef(ref, ref2);
  useEffect(() => {
    if (!pressed) {
      return;
    }
    let delta:Position, lastPosition:Position;
      delta = initialPosition
      lastPosition = initialPosition
    const applyTransform = () => {
      if (!ref.current) {
        return;
      }
      const { x, y } = lastPosition;
      ref.current.style.transform = `translate(${x}px, ${y}px)`;
    };
    const handleMouseMove = throttle(({ x : movementX, y : movementY }:Position) => {
      const { x, y } = delta;
      lastPosition = { x: movementX - x, y: movementY - y };
      applyTransform();
    });
    const handleMouseUp = (e:MouseEvent) => {
      handleMouseMove(e);
      setPressed(false);
    };
    document.addEventListener("pointermove", handleMouseMove);
    document.addEventListener("pointerup", handleMouseUp);
    return () => {
      handleMouseMove.cancel();
      document.removeEventListener("pointermove", handleMouseMove);
      document.removeEventListener("pointerup", handleMouseUp);
    };
  }, [pressed, initialPosition]);
  return [combinedRef];
};

