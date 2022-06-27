import { useEffect, useState } from 'react';

type EmptyFunctionType = () => void;

export default function useCounter(
  bind: (callback: EmptyFunctionType) => void
): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const updateCounter = (): void => {
      let newCount = count + 1;

      if (newCount === Number.MAX_SAFE_INTEGER) {
        newCount = 0;
      }

      setCount(newCount);
    };

    bind(updateCounter);
  }, [bind, count]);

  return count;
}
