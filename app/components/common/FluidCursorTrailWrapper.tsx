'use client';

import dynamic from 'next/dynamic';
import { isMobile } from 'react-device-detect';
import { useState, useEffect } from 'react';

// ssr:false is only valid inside a Client Component — this wrapper enables that.
const FluidCursorTrail = dynamic(
  () => import('./FluidCursorTrail'),
  { ssr: false }
);

export default function FluidCursorTrailWrapper() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // The fluid trail is mouse-driven only — skip the heavy WebGL simulation on touch devices.
  // Wait for client mount to avoid hydration mismatch with react-device-detect
  if (!mounted || isMobile) return null;
  return <FluidCursorTrail />;
}
