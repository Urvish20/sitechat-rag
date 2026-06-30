
export default function Input({
  type = 'text',
  label,
  error,
  icon: Icon,
  className = '',
  ...props
}) {
  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 tracking-wide uppercase">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-4 text-zinc-400 dark:text-zinc-500 pointer-events-none">
            <Icon size={18} />
          </div>
        )}
        <input
          type={type}
          className={`w-full rounded-xl border border-zinc-200 bg-white/50 px-4 py-3 text-sm transition-all focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-100 dark:focus:border-zinc-300 dark:focus:ring-zinc-300 ${Icon ? 'pl-11' : ''
            } ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500 dark:border-red-500 dark:focus:border-red-500 dark:focus:ring-red-500' : ''
            }`}
          {...props}
        />
      </div>
      {error && (
        <span className="text-xs text-red-500 font-medium mt-0.5">{error}</span>
      )}
    </div>
  );
}
