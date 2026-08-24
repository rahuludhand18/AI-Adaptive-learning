import { AiAssistant } from '@/components/AiAssistant';

// Adult section layout: renders the page plus the floating FocusPath AI Assistant on every adult screen.
export default function AdultLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <AiAssistant />
    </>
  );
}
