import React, { useState } from 'react';
import { Globe, ArrowRight } from 'lucide-react';
import Button from '../common/Button';

export default function UrlInput({ onSubmit, isLoading }) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('Please enter a website URL');
      return;
    }
    
    // Quick validation regex
    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/i;
    if (!urlPattern.test(url.trim())) {
      setError('Please enter a valid URL (e.g., https://example.com)');
      return;
    }

    setError('');
    onSubmit(url.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto space-y-4">
      <div className="relative flex items-center">
        <div className="absolute left-4.5 text-zinc-400 dark:text-zinc-500 pointer-events-none">
          <Globe size={20} />
        </div>
        
        <input
          type="text"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            if (error) setError('');
          }}
          placeholder="Enter website URL (e.g., https://example.com)"
          disabled={isLoading}
          className={`w-full rounded-2xl border border-zinc-200 bg-white/80 py-4.5 pl-13 pr-32 text-base shadow-sm transition-all focus:border-zinc-950 focus:outline-none focus:ring-1 focus:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-100 dark:focus:border-zinc-300 dark:focus:ring-zinc-300 ${
            error ? 'border-red-500 focus:border-red-500 focus:ring-red-500 dark:border-red-500 dark:focus:border-red-500 dark:focus:ring-red-500' : ''
          }`}
        />
        
        <div className="absolute right-2">
          <Button
            type="submit"
            isLoading={isLoading}
            className="rounded-xl px-5 py-2.5 font-semibold text-sm shadow-md bg-gradient-to-tr from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white border-0 transition-transform active:scale-95 cursor-pointer"
            icon={ArrowRight}
          >
            Process
          </Button>
        </div>
      </div>
      {error && (
        <p className="text-sm text-red-500 font-medium text-center">{error}</p>
      )}
    </form>
  );
}
