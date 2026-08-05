'use client';

import React from 'react';

export const PageContainer: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return (
    <main className={`max-w-[1280px] mx-auto px-4 sm:px-6 py-6 md:py-8 space-y-6 w-full ${className}`}>
      {children}
    </main>
  );
};
