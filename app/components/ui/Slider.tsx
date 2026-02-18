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
  emerald: 'accent-customBlue text-customBlue bg-customBlue/10 border-customBlue/20',
  rose: 'accent-rose-600 text-rose-600 bg-rose-50 border-rose-200',
  orange: 'accent-customOrange text-customOrange bg-customOrange/10 border-customOrange/20',
  blue: 'accent-customBlue text-customBlue bg-customBlue/50 border-customBlue/20'
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
