import { PageLoader } from "@/components/pageLoader";

export default function Page() {
  return (
    <PageLoader
      variant={"circle"}
      size="lg"
      message={"Loading"}
      overlay={true}
    />
  );
}
