'use client';

import { TestButton } from './TestButton';

export default function MinimalTestPage() {
  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Minimal Test Page</h1>
      <p>This is a minimal test page without any complex dependencies.</p>
      <TestButton />
    </div>
  );
} 