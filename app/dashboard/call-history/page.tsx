import { createAgent, getAllAgents } from "@/app/actions/agents";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import CreateAgentForm from "./comp";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import CallHistory from "./comp";

export default async function AgentsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    redirect("/login");
  }
 return <CallHistory/>

 
}
