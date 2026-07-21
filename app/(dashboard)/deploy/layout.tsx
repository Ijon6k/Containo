'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Box, Layers } from 'lucide-react';

const tabs = [
  { id: 'container', label: 'Container', href: '/deploy/container', icon: Box },
  { id: 'compose', label: 'Docker Compose', href: '/deploy/compose', icon: Layers },
];

export default function DeployLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-[calc(100vh-6rem)] flex flex-col">
      <div className="flex items-center gap-2 mb-6">
        <div className="flex bg-surface2 rounded-sm p-0.5">
          {tabs.map((tab) => {
            const active = pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={`flex items-center gap-2 px-4 py-1.5 text-[13px] font-medium rounded-sm transition-colors ${
                  active
                    ? 'bg-surface border border-border text-brand'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex-1 min-h-0">{children}</div>
    </div>
  );
}
