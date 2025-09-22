import { getAgentById } from "@/app/actions/agents";
import { Card, CardContent } from "@/components/ui/card";
import { AgentCustomizationForm } from "./comp";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
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
                The agent you're looking for doesn't exist or you don't have permission to access it.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <AgentCustomizationForm agent={agent} />;
}