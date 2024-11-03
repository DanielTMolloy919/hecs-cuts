"use client";

import { useState } from "react";
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";
import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Slider } from "~/components/ui/slider";
import {
  calculateRepayment,
  fy2024,
  RepaymentBand,
  RepaymentScheme,
} from "./data";

const MAX_HECS_DEBT = 174998;
const MAX_SALARY = 180000;

const chartConfig = {
  before: {
    label: "Before Cuts",
    color: "#2563eb",
  },
  after: {
    label: "After Cuts",
    color: "#60a5fa",
  },
} satisfies ChartConfig;

function repaymentData(
  income: number,
  scheme: RepaymentScheme,
  initialLoan: number,
) {
  const data = [];
  let remainingLoan = initialLoan;

  while (remainingLoan > 0) {
    const yearlyRepayment = calculateRepayment(income, scheme);
    remainingLoan = Math.max(0, remainingLoan - yearlyRepayment);
    data.push({ year: data.length, before: remainingLoan });
  }
  return data;
}

type LoanRepaymentChartProps = {
  income: number;
  scheme: RepaymentScheme;
  initialLoan: number;
};

function LoanRepaymentChart({
  income,
  scheme,
  initialLoan,
}: LoanRepaymentChartProps) {
  const data = repaymentData(income, scheme, initialLoan);

  return (
    <ChartContainer config={chartConfig} className="min-h-[400px] w-full">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="year"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
        />
        <YAxis
          tickFormatter={(value: number) => `$${value.toLocaleString()}`}
          tickLine={false}
          tickMargin={10}
          axisLine={false}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Line
          type="monotone"
          dataKey="before"
          stroke="var(--color-before)"
          strokeWidth={2}
          dot={false}
          strokeDasharray="5 5"
        />
        <Line
          type="monotone"
          dataKey="after"
          stroke="var(--color-after)"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ChartContainer>
  );
}

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

  const [wageIndexation, setWageIndexation] = useState<boolean>(true);

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
      <div className="pt-10" />
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl">Labour&apos;s changes</h2>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="wage_indexation"
            checked={wageIndexation}
            onCheckedChange={(checked) => setWageIndexation(checked as boolean)}
          />
          <label
            htmlFor="wage_indexation"
            className="text-sm leading-none text-gray-800 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Indexed to lower of CPI or Wage Growth
          </label>
        </div>
      </div>
      <div className="pt-10" />
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl">Loan Repayment</h2>
        <LoanRepaymentChart
          income={salary}
          scheme={fy2024}
          initialLoan={hecsDebt}
        />
      </div>
      <div className="h-32" />
    </div>
  );
}
