import dynamic from "next/dynamic";

const ApplicationSubmittedPage = dynamic(
  () => import("../../../components/NonProfitApply/ApplicationSubmittedPage"),
  {
    ssr: false,
  }
);

export default function Confirmation() {
  return <ApplicationSubmittedPage />;
}
