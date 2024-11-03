"use client";

import { useState, Suspense, useMemo } from "react";
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
import {
  yearlyRepaymentOld,
  yearlyRepaymentNew,
  type RepaymentData,
  calculateRepaymentData,
} from "./data";
import { cn } from "~/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Link } from "lucide-react";
import { toast } from "sonner";

// Add window location type since we're in a client component
declare const window: Window & typeof globalThis;

const MAX_HECS_DEBT = 174998;
const MAX_SALARY = 300000;

const chartConfig = {
  old: {
    label: "Before Cuts",
    color: "#2563eb",
  },
  new: {
    label: "After Cuts",
    color: "#60a5fa",
  },
} satisfies ChartConfig;

type LoanRepaymentChartProps = {
  data: RepaymentData[];
};

function LoanRepaymentChart({ data }: LoanRepaymentChartProps) {
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
          dataKey="old"
          stroke="var(--color-old)"
          strokeWidth={2}
          dot={false}
          strokeDasharray="5 5"
        />
        <Line
          type="monotone"
          dataKey="new"
          stroke="var(--color-new)"
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
  variant?: "currency" | "percentage";
};

function InputWithSlider({
  label,
  value,
  onChange,
  min,
  max,
  variant = "currency",
}: InputWithSliderProps) {
  const formatNumber = (num: number) => {
    if (variant === "currency") {
      return num.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });
    } else {
      return num.toFixed(1) + "%";
    }
  };

  const parseNumber = (str: string) => {
    if (variant === "currency") {
      return parseInt(str.replace(/[^\d]/g, ""), 10);
    } else {
      return parseFloat(str.replace("%", ""));
    }
  };

  return (
    <div>
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <div className="flex w-48 items-center gap-1">
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
          step={0.1}
        />
      </div>
    </div>
  );
}

export default function Calculator() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CalculatorContent />
    </Suspense>
  );
}

function CalculatorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [hecsDebt, setHecsDebt] = useState<number>(
    () => Number(searchParams.get("debt")) || 30000,
  );

  const [salary, setSalary] = useState<number>(
    () => Number(searchParams.get("salary")) || 60000,
  );

  const [cpi, setCpi] = useState<number>(
    () => Number(searchParams.get("cpi")) || 3,
  );

  const [repaymentScheme, setRepaymentScheme] = useState<boolean>(true);

  const [twentyPercentCut, setTwentyPercentCut] = useState<boolean>(true);

  const repaymentData = useMemo(() => {
    return calculateRepaymentData(salary, hecsDebt, twentyPercentCut, cpi);
  }, [salary, hecsDebt, twentyPercentCut, cpi]);

  const oldRepayment = yearlyRepaymentOld(salary, cpi);
  const newRepayment = yearlyRepaymentNew(salary, cpi);

  const repaymentDifference = Math.abs(oldRepayment - newRepayment);
  const differenceDirection = oldRepayment > newRepayment ? "less" : "more";

  const updateURL = (debt: number, income: number) => {
    const params = new URLSearchParams();
    params.set("debt", debt.toString());
    params.set("salary", income.toString());
    params.set("cpi", cpi.toString());
    router.replace(`?${params.toString()}`);
  };

  const handleHecsDebtChange = (value: number) => {
    setHecsDebt(value);
    updateURL(value, salary);
  };

  const handleSalaryChange = (value: number) => {
    setSalary(value);
    updateURL(hecsDebt, value);
  };

  const handleCpiChange = (value: number) => {
    setCpi(value);
    updateURL(hecsDebt, salary);
  };

  const handleGetLink = () => {
    // Get the current URL
    const url = window.location.href;

    // Copy to clipboard using the Clipboard API
    navigator.clipboard.writeText(url).then(
      () => {
        toast.success("Link copied to clipboard");
      },
      () => {
        toast.error("Failed to copy link");
      },
    );
  };

  return (
    <div>
      <h2 className="text-2xl">The Basics</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-4">
          <InputWithSlider
            label="How big is your HECS debt?"
            value={hecsDebt}
            onChange={handleHecsDebtChange}
            min={0}
            max={MAX_HECS_DEBT}
          />
          <InputWithSlider
            label="How much do you earn a year?"
            value={salary}
            onChange={handleSalaryChange}
            min={0}
            max={MAX_SALARY}
          />
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-medium">Labour&apos;s changes</h2>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="new_repayment_scheme"
              checked={repaymentScheme}
              onCheckedChange={(checked) =>
                setRepaymentScheme(checked as boolean)
              }
            />
            <label
              htmlFor="new_repayment_scheme"
              className="text-sm leading-none text-gray-800 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              New Marginal Repayment Scheme
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="twenty_percent_cut"
              checked={twentyPercentCut}
              onCheckedChange={(checked) =>
                setTwentyPercentCut(checked as boolean)
              }
            />
            <label
              htmlFor="twenty_percent_cut"
              className="text-sm leading-none text-gray-800 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              20% Cut
            </label>
          </div>
        </div>
      </div>
      <div className="pt-10" />
      <h2 className="text-2xl">Advanced Options</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputWithSlider
          label="CPI"
          value={cpi}
          onChange={handleCpiChange}
          min={0}
          max={15}
          variant="percentage"
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
          <div className="pt-4" />
          <div className="flex items-center justify-end gap-2">
            <span>Share this result</span>
            <Button variant="outline" onClick={handleGetLink}>
              <Link /> Get Link
            </Button>
          </div>
        </CardContent>
      </Card>
      <div className="pt-10" />
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl">Paying Off Your Debt</h2>
        <LoanRepaymentChart data={repaymentData} />
      </div>
    </div>
  );
}
