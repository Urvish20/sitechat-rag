
export default function Button({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'danger' | 'ghost'
  size = 'md', // 'sm' | 'md' | 'lg'
  isLoading = false,
  disabled = false,
  className = '',
  icon: Icon,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

  const variants = {
    primary: 'bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-950 shadow-sm focus:ring-zinc-500 dark:focus:ring-white',
    secondary: 'bg-white hover:bg-zinc-50 text-zinc-800 border border-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-850 dark:text-zinc-200 dark:border-zinc-800 focus:ring-zinc-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm focus:ring-red-500',
    ghost: 'hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-650 dark:text-zinc-400 focus:ring-zinc-500',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {!isLoading && Icon && <Icon size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} className="shrink-0" />}
      {children}
    </button>
  );
}
