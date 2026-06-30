import React from 'react';
import Card from '../common/Card';
import ProcessingProgress from './ProcessingProgress';
import ProcessingSteps from './ProcessingSteps';

export default function ProcessingStatus({ progress, steps, currentUrl }) {
  return (
    <Card className="w-full max-w-xl mx-auto p-8 shadow-xl bg-white/40 dark:bg-zinc-900/40 border-zinc-200/50 dark:border-zinc-800/50 relative overflow-hidden">
      {/* Decorative top colored bar */}
      <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-cyan-500 via-purple-500 to-indigo-500" />
      
      <div className="space-y-6">
        <div className="text-center space-y-1.5">
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Analyzing Website Content
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            We are crawling, chunking, and indexing this website's knowledge-base locally.
          </p>
        </div>

        <ProcessingProgress progress={progress} currentUrl={currentUrl} />
        
        <ProcessingSteps steps={steps} />
      </div>
    </Card>
  );
}
