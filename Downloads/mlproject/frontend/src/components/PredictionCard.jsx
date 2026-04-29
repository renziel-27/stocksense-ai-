export default function PredictionCard({ title, value, subtext, icon: Icon, colorClass }) {
  return (
    <div className="glass-card rounded-2xl p-6 flex flex-col justify-between gap-4 relative overflow-hidden group min-h-[140px]">
      <div className="flex items-start justify-between z-10 w-full">
        <p className="text-slate-300 text-sm font-medium tracking-wide">{title}</p>
        <div className={`p-2.5 rounded-xl ${colorClass.bg} flex-shrink-0 backdrop-blur-md border border-white/5 shadow-inner`}>
          <Icon className={`w-5 h-5 ${colorClass.text}`} />
        </div>
      </div>
      <div className="z-10 relative w-full mt-2">
        <h3 className="text-3xl font-black text-white tracking-tight group-hover:scale-[1.02] transition-transform origin-left">{value}</h3>
        {subtext && <p className="text-xs text-slate-400 mt-1 font-medium">{subtext}</p>}
      </div>
      <div className={`absolute -right-8 -bottom-8 w-32 h-32 ${colorClass.bg} rounded-full blur-[40px] opacity-30 group-hover:opacity-60 transition-opacity duration-500`} />
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </div>
  );
}
