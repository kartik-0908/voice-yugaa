import { auth } from "@/lib/auth";
import axios from "axios";
import { headers } from "next/headers";
import { getAllAgents } from "./agents";

import { PrismaClient } from "../../node_modules/.prisma/client";
const prisma = new PrismaClient();

export async function getTotalCallsbyagentId(agentId: string): Promise<number> {
  const res = await axios.get(
    `https://api.bolna.ai/v2/agent/${agentId}/executions`,
    {
      headers: {
        Authorization: `Bearer ${process.env.BOLNA_API_KEY}`,
      },
    }
  );
  return res.data.total || 0;
}

export async function getTotalCalls() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    throw new Error("Unauthorized request");
  }
  const agents = await prisma.agents.findMany({
    where: {
      userId: session.user.id,
    },
  });

  let total = 0;

  // Option 1: Using Promise.all
  const counts = await Promise.all(
    agents.map((agent) => getTotalCallsbyagentId(agent.bolnaId))
  );
  total = counts.reduce((sum, cnt) => sum + cnt, 0);

  return total;
}

export async function getTotalCallDurationByAgentId(
  agentId: string
): Promise<number> {
  let totalDuration = 0;
  let pageNumber = 1;
  let hasMore = true;
  const pageSize = 50; // Use maximum page size for efficiency

  while (hasMore) {
    const res = await axios.get(
      `https://api.bolna.ai/v2/agent/${agentId}/executions`,
      {
        headers: {
          Authorization: `Bearer ${process.env.BOLNA_API_KEY}`,
        },
        params: {
          page_number: pageNumber,
          page_size: pageSize,
        },
      }
    );

    // Log and sum up conversation_time from all executions in this page
    //@ts-expect-error error-expected
    res.data.data.forEach((execution) => {
      console.log(execution);
      const duration = execution.conversation_duration || 0;
      console.log(
        `Execution ID: ${execution.id}, Duration: ${duration} seconds, Status: ${execution.status}`
      );
      totalDuration += duration;
    });

    // Check if there are more pages
    hasMore = res.data.has_more || false;
    pageNumber++;
  }

  console.log(`Total duration for agent ${agentId}: ${totalDuration} seconds`);
  return totalDuration;
}
export async function getTotalCallsDuration() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    throw new Error("Unauthorized request");
  }
  const agents = await prisma.agents.findMany({
    where: {
      userId: session.user.id,
    },
  });

  let total = 0;

  // Option 1: Using Promise.all
  const counts = await Promise.all(
    agents.map((agent) => getTotalCallDurationByAgentId(agent.bolnaId))
  );
  total = counts.reduce((sum, cnt) => sum + cnt, 0);

  return total;
}


export async function getExecutionTimestamps(agentId: string): Promise<Date[]> {
  const timestamps: Date[] = [];
  let pageNumber = 1;
  let hasMore = true;
  const pageSize = 50; // Use maximum page size for efficiency

  while (hasMore) {
    const res = await axios.get(
      `https://api.bolna.ai/v2/agent/${agentId}/executions`,
      {
        headers: {
          Authorization: `Bearer ${process.env.BOLNA_API_KEY}`,
        },
        params: {
          page_number: pageNumber,
          page_size: pageSize,
        },
      }
    );

    // Extract created_at timestamps from all executions in this page
    const pageTimestamps = res.data.data.map(
        //@ts-expect-error ero repxetd
      (execution) => new Date(execution.created_at)
    );
    
    timestamps.push(...pageTimestamps);
    
    // Check if there are more pages
    hasMore = res.data.has_more || false;
    pageNumber++;
  }

  // Sort timestamps in chronological order (oldest to newest)
  timestamps.sort((a, b) => a.getTime() - b.getTime());

  console.log(`Found ${timestamps.length} executions for agent ${agentId}`);
  
  return timestamps;
}


export async function getAllExecutionTimestamps() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    throw new Error("Unauthorized request");
  }
  
  const agents = await prisma.agents.findMany({
    where: {
      userId: session.user.id,
    },
  });

  // Fetch timestamps for all agents in parallel
  const timestampArrays = await Promise.all(
    agents.map((agent) => getExecutionTimestamps(agent.bolnaId))
  );
  
  // Flatten all arrays into a single array
  const allTimestamps = timestampArrays.flat();
  
  // Sort by creation time (oldest to newest)
  allTimestamps.sort((a, b) => a.getTime() - b.getTime());

  return allTimestamps;
}