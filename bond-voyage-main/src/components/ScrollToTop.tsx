import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) return;

    const forceScrollToTop = () => {
      const methods = [
        () => window.scrollTo({ top: 0, left: 0, behavior: "instant" }),
        () => window.scrollTo(0, 0),
        () => {
          document.documentElement.scrollTop = 0;
        },
        () => {
          document.body.scrollTop = 0;
        },
      ];

      for (const method of methods) {
        try {
          method();
        } catch (e) {}
      }

      const scrollableSelectors = [
        "main",
        '[class*="scroll"]',
        '[class*="overflow-auto"]',
        '[class*="overflow-y-auto"]',
      ];

      scrollableSelectors.forEach((selector) => {
        document.querySelectorAll(selector).forEach((element) => {
          if (element.scrollTop > 0) {
            (element as HTMLElement).scrollTop = 0;
          }
        });
      });
    };

    const timer = setTimeout(forceScrollToTop, 50);
    return () => clearTimeout(timer);
  }, [pathname, hash]);

  return null;
}
