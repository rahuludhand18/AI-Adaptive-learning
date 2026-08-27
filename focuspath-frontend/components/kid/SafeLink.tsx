'use client';

import React, { useState } from 'react';
import { ExternalLink, AlertTriangle } from 'lucide-react';
import { useTabTracker } from '@/hooks/useTabTracker'; // Optional depending on how we track
import { useAuthStore } from '@/store/authStore';

const ALLOWED_DOMAINS = [
  'wikipedia.org',
  'khanacademy.org',
  'coursera.org',
  'edu.gov'
];

interface SafeLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export default function SafeLink({ href, children, className = '' }: SafeLinkProps) {
  const [showToast, setShowToast] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    
    try {
      const url = new URL(href);
      const isAllowed = ALLOWED_DOMAINS.some(domain => 
        url.hostname === domain || url.hostname.endsWith(`.${domain}`)
      );

      if (isAllowed) {
        // Flag for useTabTracker to not penalize this specific outbound navigation
        sessionStorage.setItem('allowed_website_visit', url.hostname);
        window.open(href, '_blank', 'noopener,noreferrer');
      } else {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }
    } catch (err) {
      // Invalid URL
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  return (
    <div className="relative inline-block">
      <a 
        href={href} 
        onClick={handleClick}
        className={`inline-flex items-center gap-1 hover:underline cursor-pointer ${className}`}
      >
        {children}
        <ExternalLink className="h-3 w-3 opacity-70" />
      </a>

      {showToast && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max bg-rose-900 text-rose-100 text-xs font-bold py-2 px-3 rounded-xl shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 z-50">
          <AlertTriangle className="h-4 w-4 text-rose-400" />
          <span>Focus Mode: This website is restricted.</span>
        </div>
      )}
    </div>
  );
}
