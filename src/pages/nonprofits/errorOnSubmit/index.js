import dynamic from "next/dynamic";

const ErrorSubmittingApplication = dynamic(
  () => import("../../../components/NonProfitApply/ErrorSubmittingApplication"),
  {
    ssr: false,
  }
);

export default function ErrorOnSubmitting() {
  return <ErrorSubmittingApplication />;
}
