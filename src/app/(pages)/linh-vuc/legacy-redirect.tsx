"use client";

import { useEffect } from "react";

export function LegacyRedirect() {
  useEffect(() => {
    window.location.replace(`/nang-luc-xay-dung${window.location.search}${window.location.hash}`);
  }, []);

  return null;
}
