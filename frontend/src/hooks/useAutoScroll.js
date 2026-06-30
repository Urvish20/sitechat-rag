import { useEffect, useRef } from 'react';

/**
 * Custom hook to automatically scroll a container to the bottom when a dependency updates.
 * 
 * @param {any} dependency - Dependency that triggers scroll when changed.
 * @returns {React.RefObject} Ref to attach to the scrollable container.
 */
export function useAutoScroll(dependency) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [dependency]);

  return containerRef;
}
