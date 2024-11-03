import Calculator from "./calculator";

function MarginalRepaymentExplainer() {
  return (
    <>
      <h2 className="pt-4 text-xl">
        What is the New Marginal Repayment Scheme?
      </h2>
      <p className="pt-2">
        This is a new repayment rate that Labour is proposing to implement for
        HECS debt if they win the next election. The big difference is that
        unlike the current system, it is{" "}
        <span className="font-bold">marginal</span>, meaning it only applies to
        the portion of your income that exceeds the repayment threshold - the
        same way income tax works.
      </p>
      <p className="pt-2">
        As well as this, the new scheme bumps the repayment threshold from
        $54,435 to $67,000. All calculations are based off of this{" "}
        <a
          href="https://www.education.gov.au/higher-education-loan-program/resources/making-student-repayments-fairer"
          className="underline"
        >
          Department of Education document
        </a>
        .
      </p>
    </>
  );
}

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
      <h2 className="pt-4 text-2xl">Explanations</h2>
      <MarginalRepaymentExplainer />
      <div className="h-64" />
    </main>
  );
}
