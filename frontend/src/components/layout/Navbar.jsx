import { Menu, MessageSquare } from 'lucide-react';
import Button from '../common/Button';

const GithubIcon = ({ size = 20 }) => (
  <svg height={size} width={size} viewBox="0 0 16 16" fill="currentColor">
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
  </svg>
);

export default function Navbar({
  toggleSidebar,
}) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/70 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/70">
      <div className="flex h-14 items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="lg:hidden text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            icon={Menu}
            aria-label="Toggle Sidebar"
          />
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-cyan-500 to-purple-500 text-white shadow-md shadow-cyan-500/10">
              <MessageSquare size={18} />
            </div>
            <span className="font-bold text-zinc-900 dark:text-white tracking-tight text-md">
              SiteChat
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* GitHub link */}
          <a
            href="https://github.com/Urvish20/sitechat-rag"
            target="_blank"
            rel="noreferrer"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-500 hover:bg-zinc-150 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100 transition-colors"
            title="View on GitHub"
          >
            <GithubIcon size={20} />
          </a>
        </div>
      </div>
    </header>
  );
}
