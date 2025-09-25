import { getAgentById } from "@/app/actions/agents";
import { Card, CardContent } from "@/components/ui/card";
import { AgentCustomizationForm } from "./comp";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    redirect("/login");
  }
  const { id } = await params;
  const agent = await getAgentById(id);

  if (!agent) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2">Agent Not Found</h2>
              <p className="text-muted-foreground">
                The agent you&apos;re looking for doesn&apos;t exist or you
                don&apos;t have permission to access it.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <AgentCustomizationForm agent={agent} />;
}
