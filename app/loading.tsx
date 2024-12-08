export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 sm:p-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIvPjwvc3ZnPg==')] opacity-50"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-purple-500/10"></div>

      <div className="relative">
        {/* Modernized spinning ring with a more vibrant color scheme */}
        <div className="w-32 h-32 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin-fast"></div>

        {/* Inner spinning ring with a modern twist */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full border-4 border-purple-500/20 border-b-purple-500 animate-[spin_0.6s_linear_infinite_reverse]"></div>

        {/* Center pulsing dot with a modern look */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-blue-500 rounded-full animate-pulse-fast"></div>
      </div>

      {/* Loading text with a modern gradient effect */}
      <div className="mt-8 text-xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 bg-[length:200%_auto] animate-[gradient_2s_linear_infinite] bg-clip-text text-transparent">
        Loading...
      </div>
    </div>
  );
}
