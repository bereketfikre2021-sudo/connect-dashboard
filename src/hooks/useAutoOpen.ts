import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Reads ?new=1 from the URL and calls openFn() once on mount.
 * Cleans up the param so the form doesn't re-open on back navigation.
 */
export function useAutoOpen(openFn: () => void) {
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('new') === '1') {
      openFn();
      setSearchParams({}, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
