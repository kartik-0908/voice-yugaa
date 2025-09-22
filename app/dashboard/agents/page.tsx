import { createAgent, getAllAgents } from "@/app/actions/agents";
import { Agent } from "@/lib/types";
import { ChevronsLeftRight } from "lucide-react";
import { revalidatePath } from "next/cache";
import Link from "next/link";

// Server Action for creating agent
async function handleCreateAgent(formData: FormData): Promise<void> {
  "use server";

  const name = formData.get("name") as string;

  if (!name || name.trim().length === 0) {
    return;
  }

  await createAgent(name.trim());
  revalidatePath("/dashboard/agents");
}

export default async function AgentsPage() {
  const agents = await getAllAgents();

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">AI Agents</h1>

      {/* Create Agent Card */}
      <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-6 mb-8 hover:border-gray-400 transition-colors">
        <form action={handleCreateAgent} className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold mb-2">Create New Agent</h2>
            <p className="text-gray-600 mb-4">
              Give your AI agent a name to get started
            </p>
          </div>

          <div className="flex gap-3">
            <input
              type="text"
              name="name"
              placeholder="Enter agent name..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              minLength={1}
              maxLength={50}
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Create Agent
            </button>
          </div>
        </form>
      </div>

      {/* Agents List */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">
          Your Agents ({agents.length})
        </h2>

        {agents.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">🤖</div>
            <p className="text-lg">No agents created yet</p>
            <p>Create your first AI agent above to get started</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent, i) => (
              <div
                key={agent.id}
                className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {
                        //@ts-ignore

                        agent.name.charAt(0).toUpperCase()
                      }
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{
                      //@ts-ignore
                      agent.name}</h3>
                      <p className="text-sm text-gray-500">AI Agent</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Active</span>
                  </div>
                  <p className="text-sm text-gray-500">ID: {agent.id}</p>
                </div>

                <div className="">
                  <Link
                    href={`/dashboard/agents/${agent.id}`}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                  >
                    Configure
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
