"use server";

import { PrismaClient } from "../../node_modules/.prisma/client";
import axios from "axios";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// Define the Agent type
export interface AgentwithName {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Agent {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

const prisma = new PrismaClient();

export async function getAgentName(id: string) {
  const agent = await prisma.agents.findUnique({
    where: {
      id: id,
    },
  });
  console.log(agent);
  const token = process.env.BOLNA_API_KEY;
  console.log(token);
  const res = await axios.get(
    `https://api.bolna.ai/v2/agent/${agent?.bolnaId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  console.log(res.data);
  return res.data.agent_name;
}

// Get all agents
export async function getAllAgents(): Promise<AgentwithName[]> {
  try {
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
      orderBy: {
        createdAt: "desc",
      },
    });
    const agentsWithNames = await Promise.all(
      agents.map(async (agent) => {
        try {
          const name = await getAgentName(agent.id);
          return {
            ...agent,
            name: name,
          };
        } catch (error) {
          console.error(`Error fetching name for agent ${agent.id}:`, error);
          return {
            ...agent,
            name: null, // or some default value
          };
        }
      })
    );

    return agentsWithNames;
  } catch (error) {
    console.error("Error fetching agents:", error);
    return [];
  }
}

// Create a new agent
export async function createAgent(name: string): Promise<Agent> {

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session) {
      throw new Error("Unauthorized request");
    }
    const token = process.env.BOLNA_API_KEY;
    const res = await axios.post(
      "https://api.bolna.ai/v2/agent",
      {
        agent_config: {
          agent_name: name,
          agent_welcome_message: "How May I help you today?",
          tasks: [
            {
              task_type: "conversation",
              tools_config: {
                llm_agent: {
                  agent_type: "simple_llm_agent",
                  agent_flow_type: "streaming",
                  llm_config: {
                    agent_flow_type: "streaming",
                    provider: "openai",
                    family: "openai",
                    model: "gpt-4.1-mini",
                    summarization_details: null,
                    extraction_details: null,
                    max_tokens: 150,
                    presence_penalty: 0,
                    frequency_penalty: 0,
                    base_url: "https://api.openai.com/v1",
                    top_p: 0.9,
                    min_p: 0.1,
                    top_k: 0,
                    temperature: 0.1,
                    request_json: true,
                  },
                },
                synthesizer: {
                  stream: true,
                  caching: true,
                  provider: "sarvam",
                  buffer_size: 200,
                  audio_format: "wav",
                  provider_config: {
                    model: "bulbul:v2",
                    speed: 1.0,
                    voice: "Vidya",
                    voice_id: "vidya",
                    temperature: 0.5,
                    similarity_boost: 0.5,
                  },
                },
                transcriber: {
                  provider: "deepgram",
                  model: "nova-3",
                  language: "multi-hi",
                  stream: true,
                  sampling_rate: 16000,
                  encoding: "linear16",
                  endpointing: 100,
                },
                input: {
                  provider: "plivo",
                  format: "wav",
                },
                output: {
                  provider: "plivo",
                  format: "wav",
                },
                api_tools: null,
              },
              toolchain: {
                execution: "parallel",
                pipelines: [["transcriber", "llm", "synthesizer"]],
              },
              task_config: {
                hangup_after_silence: 10,
                incremental_delay: 400,
                number_of_words_for_interruption: 2,
                hangup_after_LLMCall: false,
                call_cancellation_prompt: null,
                backchanneling: false,
                backchanneling_message_gap: 5,
                backchanneling_start_delay: 5,
                ambient_noise: false,
                ambient_noise_track: "office-ambience",
                call_terminate: 90,
                voicemail: false,
                inbound_limit: -1,
                whitelist_phone_numbers: ["<any>"],
                disallow_unknown_numbers: false,
              },
            },
          ],
        },
        agent_prompts: {
          task_1: {
            system_prompt: "You are an AI assistant , your job is to help people for whatever they ask",
          },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log(res.data);
    const agent = res.data;

    const dbagent = await prisma.agents.create({
      data: {
        bolnaId: agent.agent_id,
        userId: session.user.id,
      },
    });
    return dbagent;
  } catch (error) {
    console.error("Error creating agent:", error);
    throw new Error("Failed to create agent");
  }
}

// Get agent by ID
export async function getAgentById(id: string) {
  try {
    const agent = await prisma.agents.findUnique({
      where: {
        id: id,
      },
    });
    console.log(agent);
    const token = process.env.BOLNA_API_KEY;
    console.log(token);
    const res = await axios.get(
      `https://api.bolna.ai/v2/agent/${agent?.bolnaId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log(res.data.tasks[0].tools_config.synthesizer.provider_config);
    return {
      id: id,
      name: res.data.agent_name || "",
      firstMessage: res.data.agent_welcome_message || "",
      systemPrompt: res.data.agent_prompts.task_1.system_prompt || "",
      voiceId:
        res.data.tasks[0].tools_config.synthesizer.provider_config.voice_id,
      voiceName:
        res.data.tasks[0].tools_config.synthesizer.provider_config.voice,
    };
  } catch (error) {
    console.error("Error fetching agent:", error);
    return null;
  }
}

// Update agent name
export async function updateAgent(
  id: string,
  formData: {
    name: string;
    firstMessage: string;
    systemPrompt: string;
    voiceId: string;
    voiceName: string;
  }
) {
  const token = process.env.BOLNA_API_KEY;
  try {
    const agent = await prisma.agents.findUnique({
      where: {
        id,
      },
      select: {
        bolnaId: true,
      },
    });

    if (!agent) {
      throw new Error("Agent not found");
    }
    console.log("updating agent with id", id, agent.bolnaId);
    const res = await axios.put(
      `https://api.bolna.ai/v2/agent/${agent.bolnaId}`,
      {
        agent_config: {
          agent_name: formData.name,
          agent_welcome_message: formData.firstMessage,
          tasks: [
            {
              task_type: "conversation",
              tools_config: {
                llm_agent: {
                  agent_type: "simple_llm_agent",
                  agent_flow_type: "streaming",
                  llm_config: {
                    agent_flow_type: "streaming",
                    provider: "openai",
                    family: "openai",
                    model: "gpt-4.1-mini",
                    summarization_details: null,
                    extraction_details: null,
                    max_tokens: 150,
                    presence_penalty: 0,
                    frequency_penalty: 0,
                    base_url: "https://api.openai.com/v1",
                    top_p: 0.9,
                    min_p: 0.1,
                    top_k: 0,
                    temperature: 0.1,
                    request_json: true,
                  },
                },
                synthesizer: {
                  stream: true,
                  caching: true,
                  provider: "sarvam",
                  buffer_size: 200,
                  audio_format: "wav",
                  provider_config: {
                    model: "bulbul:v2",
                    speed: 1.0,
                    voice: formData.voiceName,
                    voice_id: formData.voiceId,
                    temperature: 0.5,
                    similarity_boost: 0.5,
                  },
                },
                transcriber: {
                  provider: "deepgram",
                  model: "nova-3",
                  language: "multi-hi",
                  stream: true,
                  sampling_rate: 16000,
                  encoding: "linear16",
                  endpointing: 100,
                },
                input: {
                  provider: "plivo",
                  format: "wav",
                },
                output: {
                  provider: "plivo",
                  format: "wav",
                },
                api_tools: null,
              },
              toolchain: {
                execution: "parallel",
                pipelines: [["transcriber", "llm", "synthesizer"]],
              },
              task_config: {
                hangup_after_silence: 10,
                incremental_delay: 400,
                number_of_words_for_interruption: 2,
                hangup_after_LLMCall: false,
                call_cancellation_prompt: null,
                backchanneling: false,
                backchanneling_message_gap: 5,
                backchanneling_start_delay: 5,
                ambient_noise: false,
                ambient_noise_track: "office-ambience",
                call_terminate: 90,
                voicemail: false,
                inbound_limit: -1,
                whitelist_phone_numbers: ["<any>"],
                disallow_unknown_numbers: false,
              },
            },
          ],
        },
        agent_prompts: {
          task_1: {
            system_prompt: formData.systemPrompt,
          },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log(res.data);
  } catch (error) {
    console.error("Error updating agent:", error);
    throw new Error("Failed to update agent");
  }
}

export async function initiateCallfromAgent(id: string, to: string) {
  const token = process.env.BOLNA_API_KEY;
  try {
    const agent = await prisma.agents.findUnique({
      where: {
        id,
      },
      select: {
        bolnaId: true,
      },
    });

    if (!agent) {
      throw new Error("Agent not found");
    }
    console.log("updating agent with id", id);
    const res = await axios.post(
      `https://api.bolna.ai/call`,
      {
        agent_id: agent.bolnaId,
        recipient_phone_number: to,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (error) {
    console.error("Error updating agent:", error);
    throw new Error("Failed to update agent");
  }
}

// Delete agent
export async function deleteAgent(id: string): Promise<boolean> {
  try {
    await prisma.agents.delete({
      where: {
        id: id,
      },
    });
    return true;
  } catch (error) {
    console.error("Error deleting agent:", error);
    throw new Error("Failed to delete agent");
  }
}
