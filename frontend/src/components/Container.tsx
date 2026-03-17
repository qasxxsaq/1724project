import React from "react";

export function Container({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8">
      {children}
    </main>
  );
}
