"use client";

import { useEffect } from "react";

export default function PreventZoomClient() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Prevent iOS Safari multi-touch pinch-to-zoom gestures
    const handleGesture = (e: Event) => {
      e.preventDefault();
    };

    // 2. Prevent multi-finger touch pinch zoom while preserving single-finger scroll & tap
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches && e.touches.length > 1) {
        e.preventDefault();
      }
    };

    // 3. Prevent Ctrl + Wheel / Trackpad pinch-zoom on desktop
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
      }
    };

    // Register non-passive listeners to allow cancelable gesture prevention
    document.addEventListener("gesturestart", handleGesture, { passive: false });
    document.addEventListener("gesturechange", handleGesture, { passive: false });
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      document.removeEventListener("gesturestart", handleGesture);
      document.removeEventListener("gesturechange", handleGesture);
      document.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("wheel", handleWheel);
    };
  }, []);

  return null;
}
