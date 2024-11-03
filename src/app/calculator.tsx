"use client";

import { useState } from "react";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Slider } from "~/components/ui/slider";

type InputWithSliderProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
};

function InputWithSlider({
  label,
  value,
  onChange,
  min,
  max,
}: InputWithSliderProps) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <div className="flex w-48 items-center gap-1">
          <span className="text-sm">$</span>
          <Input
            type="number"
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            min={min}
            max={max}
          />
        </div>
        <Slider
          value={[value]}
          onValueChange={([value]) => value !== undefined && onChange(value)}
          min={min}
          max={max}
        />
      </div>
    </div>
  );
}

export default function Calculator() {
  const [hecsDebt, setHecsDebt] = useState<number>(1000);

  return (
    <div>
      <InputWithSlider
        label="How big is your HECS debt?"
        value={hecsDebt}
        onChange={setHecsDebt}
        min={0}
        max={100000}
      />
    </div>
  );
}
