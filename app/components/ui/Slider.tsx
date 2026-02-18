/**
 * COMPOSANT SLIDER RÉUTILISABLE
 */

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
  color?: 'emerald' | 'rose' | 'orange' | 'blue';
}

const colorClasses = {
  emerald: 'accent-emerald-600 text-emerald-600 bg-emerald-50 border-emerald-200',
  rose: 'accent-rose-600 text-rose-600 bg-rose-50 border-rose-200',
  orange: 'accent-orange-600 text-orange-600 bg-orange-50 border-orange-200',
  blue: 'accent-blue-600 text-blue-600 bg-blue-50 border-blue-200'
};

export function Slider({ 
  label, value, min, max, step = 1, unit = '', onChange, color = 'emerald' 
}: SliderProps) {
  const colors = colorClasses[color];
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        <span className={`text-sm font-bold px-2 py-0.5 rounded ${colors}`}>
          {value}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className={`w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer ${colors.split(' ')[0]}`}
      />
    </div>
  );
}
