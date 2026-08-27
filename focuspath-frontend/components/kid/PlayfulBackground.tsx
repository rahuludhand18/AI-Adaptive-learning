'use client';

// A soft layer of floating animals, birds, and treats behind Kid Mode pages — purely
// decorative (pointer-events-none), so it never interferes with the real UI underneath.
const CRITTERS = [
  { emoji: '🦁', top: '6%', left: '4%', size: 'text-4xl', delay: '0s', anim: 'animate-kid-float' },
  { emoji: '🐧', top: '14%', left: '92%', size: 'text-3xl', delay: '0.4s', anim: 'animate-kid-bob' },
  { emoji: '🦋', top: '78%', left: '8%', size: 'text-3xl', delay: '0.8s', anim: 'animate-kid-wiggle' },
  { emoji: '🐘', top: '85%', left: '90%', size: 'text-4xl', delay: '0.2s', anim: 'animate-kid-float' },
  { emoji: '🍎', top: '38%', left: '96%', size: 'text-2xl', delay: '1s', anim: 'animate-kid-bob' },
  { emoji: '🍕', top: '92%', left: '48%', size: 'text-2xl', delay: '0.6s', anim: 'animate-kid-wiggle' },
  { emoji: '🎈', top: '4%', left: '48%', size: 'text-3xl', delay: '0.3s', anim: 'animate-kid-float' },
  { emoji: '🐦', top: '55%', left: '2%', size: 'text-2xl', delay: '1.2s', anim: 'animate-kid-bob' },
  { emoji: '🌟', top: '20%', left: '18%', size: 'text-xl', delay: '0.7s', anim: 'animate-kid-wiggle' },
  { emoji: '🦊', top: '68%', left: '95%', size: 'text-3xl', delay: '0.5s', anim: 'animate-kid-float' },
];

export default function PlayfulBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none select-none" aria-hidden="true">
      {CRITTERS.map((c, i) => (
        <span
          key={i}
          className={`absolute ${c.size} ${c.anim} opacity-20 dark:opacity-15`}
          style={{ top: c.top, left: c.left, animationDelay: c.delay }}
        >
          {c.emoji}
        </span>
      ))}
    </div>
  );
}
