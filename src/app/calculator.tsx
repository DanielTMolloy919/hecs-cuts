"use client";

import { useState, useDeferredValue } from "react";
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

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
import { yearlyRepaymentOld, yearlyRepaymentNew } from "./data";
import { cn } from "~/lib/utils";

const MAX_HECS_DEBT = 174998;
const MAX_SALARY = 300000;

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

function repaymentData(income: number, initialLoan: number) {
  // Validate inputs
  if (income <= 0 || initialLoan <= 0) {
    return Array(30)
      .fill(0)
      .map((_, year) => ({ year, before: initialLoan, after: initialLoan }));
  }

  const data = [];
  let remainingLoanBefore = initialLoan;
  let remainingLoanAfter = initialLoan;
  const oldRepayment = yearlyRepaymentOld(income);
  const newRepayment = yearlyRepaymentNew(income);

  // If no repayment is being made, show flat line
  if (oldRepayment === 0 && newRepayment === 0) {
    return Array(30)
      .fill(0)
      .map((_, year) => ({ year, before: initialLoan, after: initialLoan }));
  }

  // Calculate until loan is paid off or 30 years reached
  for (
    let year = 0;
    year < 30 && (remainingLoanBefore > 0 || remainingLoanAfter > 0);
    year++
  ) {
    data.push({
      year,
      before: Math.max(0, remainingLoanBefore),
      after: Math.max(0, remainingLoanAfter),
    });
    remainingLoanBefore = Math.max(0, remainingLoanBefore - oldRepayment);
    remainingLoanAfter = Math.max(0, remainingLoanAfter - newRepayment);
  }

  // Add final zero if both loans are paid off
  if (remainingLoanBefore === 0 && remainingLoanAfter === 0) {
    data.push({ year: data.length, before: 0, after: 0 });
  }

  return data;
}

type LoanRepaymentChartProps = {
  income: number;
  initialLoan: number;
};

function LoanRepaymentChart({ income, initialLoan }: LoanRepaymentChartProps) {
  const data = repaymentData(income, initialLoan);

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

  const deferredSalary = useDeferredValue(salary);

  const oldRepayment = yearlyRepaymentOld(deferredSalary);
  const newRepayment = yearlyRepaymentNew(deferredSalary);

  const repaymentDifference = Math.abs(oldRepayment - newRepayment);
  const differenceDirection = oldRepayment > newRepayment ? "less" : "more";

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
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-normal">Results</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            Your yearly repayment was{" "}
            <span className={cn("font-bold")}>
              ${oldRepayment.toLocaleString()}
            </span>
          </p>
          <p>
            Your yearly repayment will be{" "}
            <span
              className={cn(
                "font-bold",
                oldRepayment < newRepayment ? "text-red-500" : "text-green-500",
              )}
            >
              ${newRepayment.toLocaleString()} ($
              {repaymentDifference.toLocaleString()} {differenceDirection})
            </span>
          </p>
        </CardContent>
      </Card>
      <div className="pt-10" />
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl">Labour&apos;s changes</h2>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="new_repayment_scheme"
            checked={wageIndexation}
            onCheckedChange={(checked) => setWageIndexation(checked as boolean)}
          />
          <label
            htmlFor="new_repayment_scheme"
            className="text-sm leading-none text-gray-800 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            New Marginal Repayment Scheme
          </label>
        </div>
      </div>
      <div className="pt-10" />
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl">Loan Repayment</h2>
        <LoanRepaymentChart income={deferredSalary} initialLoan={hecsDebt} />
      </div>
      <div className="h-32" />
    </div>
  );
}
