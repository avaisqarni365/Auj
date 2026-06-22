'use client';

import { useTranslations } from 'next-intl';

// The white top line — shown above the header on every page so the brand chrome is consistent.
export function AnnouncementBar() {
  const tl = useTranslations('landing');
  return (
    <div className="border-b border-sand-200 bg-white text-[13px] text-sand-700">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-end gap-x-4 gap-y-1 px-[clamp(16px,4vw,32px)] py-2">
        <span className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-gold" />
          {tl('announce')}
        </span>
        <span className="flex items-center gap-4 text-sand-500">
          <a href="/#agents" className="font-medium hover:text-green-800">{tl('forAgents')}</a>
          <span>🌐 EN · LT · UR · AR</span>
        </span>
      </div>
    </div>
  );
}
