import React from 'react';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import Button from '../components/common/Button';

export default function NotFound({ onGoBack }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center min-h-[70vh] px-6 text-center space-y-6 animate-fade-in">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400 dark:bg-zinc-900 dark:text-zinc-500">
        <RefreshCw size={28} className="animate-spin-slow" />
      </div>

      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-5xl">
          Page Not Found
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
          The view or resource you are looking for does not exist or has been relocated.
        </p>
      </div>

      <Button
        variant="primary"
        onClick={onGoBack}
        icon={ArrowLeft}
        className="shadow-md"
      >
        Return to Home
      </Button>
    </div>
  );
}
