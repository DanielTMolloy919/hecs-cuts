import Calculator from "./calculator";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-screen-md flex-col px-6">
      <div className="pt-10" />
      <h1 className="text-4xl">Labour&apos;s HECS Cuts</h1>
      <p className="text-gray-500">
        How much will you save with Labour&apos;s HECS cuts?
      </p>
      <div className="pt-5" />
      <Calculator />
    </main>
  );
}
