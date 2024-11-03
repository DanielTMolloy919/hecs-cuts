"use client";

import { useState } from "react";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Slider } from "~/components/ui/slider";

const MAX_HECS_DEBT = 174998;
const MAX_SALARY = 180000;

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
  const formatNumber = (num: number) => num.toLocaleString("en-US");
  const parseNumber = (str: string) => parseInt(str.replace(/,/g, ""), 10);

  return (
    <div>
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <div className="flex w-48 items-center gap-1">
          <span className="text-sm">$</span>
          <Input
            type="text"
            value={formatNumber(value)}
            onChange={(e) => {
              const parsedValue = parseNumber(e.target.value);
              if (!isNaN(parsedValue)) {
                onChange(parsedValue);
              }
            }}
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
  const [hecsDebt, setHecsDebt] = useState<number>(30000);

  const [salary, setSalary] = useState<number>(60000);

  return (
    <div>
      <div className="flex flex-col gap-4">
        <InputWithSlider
          label="How big is your HECS debt?"
          value={hecsDebt}
          onChange={setHecsDebt}
          min={0}
          max={MAX_HECS_DEBT}
        />
        <InputWithSlider
          label="How much do you earn a year?"
          value={salary}
          onChange={setSalary}
          min={0}
          max={MAX_SALARY}
        />
      </div>
      <div className="pt-4"></div>
      <div>
        <h2 className="text-2xl">Labour&apos;s changes</h2>
      </div>
    </div>
  );
}
