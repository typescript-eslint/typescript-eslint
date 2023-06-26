// Modified from https://github.com/antonioru/beautiful-react-hooks/blob/master/src/useMediaQuery.ts

import { useEffect, useState } from 'react';

/**
 * Accepts a media query string then uses the
 * [window.matchMedia](https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia) API to determine if it
 * matches with the current document.<br />
 * It also monitor the document changes to detect when it matches or stops matching the media query.<br />
 * Returns the validity state of the given media query.
 *
 */
const useMediaQuery = (mediaQuery: string): boolean => {
  const [isVerified, setIsVerified] = useState<boolean>(
    !!window.matchMedia(mediaQuery).matches,
  );

  useEffect(() => {
    const mediaQueryList = window.matchMedia(mediaQuery);
    const documentChangeHandler = (): void =>
      setIsVerified(!!mediaQueryList.matches);

    try {
      mediaQueryList.addEventListener('change', documentChangeHandler);
    } catch (e) {
      // Safari isn't supporting mediaQueryList.addEventListener
      // eslint-disable-next-line deprecation/deprecation
      mediaQueryList.addListener(documentChangeHandler);
    }

    documentChangeHandler();
    return () => {
      try {
        mediaQueryList.removeEventListener('change', documentChangeHandler);
      } catch (e) {
        // Safari isn't supporting mediaQueryList.removeEventListener
        // eslint-disable-next-line deprecation/deprecation
        mediaQueryList.removeListener(documentChangeHandler);
      }
    };
  }, [mediaQuery]);

  return isVerified;
};

export { useMediaQuery };
