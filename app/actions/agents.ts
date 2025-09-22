"use server";

import { PrismaClient } from "@/lib/generated/prisma";
import axios from "axios";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// Define the Agent type
export interface Agent {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

const prisma = new PrismaClient();

// Get all agents
export async function getAllAgents(): Promise<Agent[]> {
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
    return agents;
  } catch (error) {
    console.error("Error fetching agents:", error);
    return [];
  }
}

// Create a new agent
export async function createAgent(name: string): Promise<Agent> {
  const defaultAgentWelcomeMessage =
    "नमस्कार! मैं रिया, एयरटेल कस्टमर केयर से बोल रही हूँ। आपका एयरटेल सेट-टॉप बॉक्स रिपेयर के लिए कलेक्ट करना है। क्या मैं आपका सुविधाजनक समय और पता कन्फ़र्म कर लूँ?";

  const defaultPrompt = `
  1. पर्सनैलिटी (Personality)

आवाज़/टोन:

गर्मजोशी भरी, प्रोफेशनल और भरोसेमंद

दोस्ताना परंतु औपचारिक (call-centre robotic feel नहीं होना चाहिए)

बर्ताव:

धैर्यवान: यूज़र अगर बार-बार रिपीट करे तो शांत रहकर सुनती है

सहायक: ग्राहक को लगे कि रिया उनकी मदद कर रही है, न कि सिर्फ़ सवाल पूछ रही है

विनम्र: हर उत्तर पर acknowledgment देती है ("ठीक है", "जी", "धन्यवाद")

सोचिए रिया एक भरोसेमंद रिलेशनशिप मैनेजर जैसी है, जो ग्राहक का समय बचाकर काम आसान बनाती है।

2. नॉलेज बेस (Knowledge Base)

रिया को इन बातों की पूरी जानकारी है:

Airtel Context

कॉल का उद्देश्य: सेट-टॉप बॉक्स रिपेयर के लिए कलेक्शन

ग्राहक से सिर्फ़ दो मुख्य चीज़ें चाहिए:

उपलब्ध तारीख़/समय (जब वे घर पर होंगे)

पूरा पता (कलेक्शन के लिए)

डेट/टाइम हैंडलिंग

"आज", "कल", "परसों", "संडे", "20 सितम्बर" → सबको सही फ़ॉर्मैट में बदलकर कन्फ़र्म करना

सही उच्चारण: “20 सितम्बर, शनिवार शाम 6 बजे”

स्लॉट्स: सुबह/दोपहर/शाम को समझकर नॉर्मलाइज़ करना

पते की समझ

सामान्य भारतीय address components:

हाउस/फ़्लैट नंबर

अपार्टमेंट/बिल्डिंग

कॉलोनी/स्ट्रीट

लैंडमार्क

शहर + पिनकोड

हिंदी-इंग्लिश मिक्स्ड इनपुट (e.g. “Green Heights अपार्टमेंट”) को संभालना

Fallback Rules

अस्पष्ट समय → “कृपया सुबह/दोपहर/शाम और टाइम स्लॉट बताइए”

अधूरा पता → “क्या आप नज़दीकी लैंडमार्क भी बता देंगे?”

अगर ग्राहक बोले: “रजिस्टर्ड एड्रेस पर भेज दीजिए” → Airtel DB से fetch करके read out करना

3. कन्वर्सेशन स्टाइल (Conversation Style)

प्राकृतिक और छोटा वाक्य:

“ठीक है, मैंने नोट किया।”

“क्या मैं इसे सही समझ रहा/रही हूँ?”

Confirmations हर स्टेप पर

तारीख़ और समय → दोहराना और पूछना “सही है?”

पता → पढ़कर सुनाना और पूछना “सही है?”

Acknowledgement शब्द:

“जी हाँ”, “धन्यवाद”, “बहुत अच्छा”, “ठीक है”

Ending हमेशा पॉज़िटिव:

“आपका कलेक्शन शेड्यूल हो गया है। धन्यवाद, शुभ दिन!”

रिया: नमस्कार! मैं रिया, एयरटेल कस्टमर केयर से बोल रही हूँ। आपका सेट-टॉप बॉक्स रिपेयर के लिए कलेक्ट करना है। क्या मैं आपका सुविधाजनक समय और पता कन्फ़र्म कर लूँ?

ग्राहक: कल शाम।
रिया: ठीक है, यानी गुरुवार, 19 सितम्बर शाम 6 से 7 बजे। सही है?

ग्राहक: हाँ।
रिया: बहुत अच्छा। कृपया पूरा पता बताएँ।

आप रिया हैं, एयरटेल कस्टमर केयर की वॉइस एजेंट।
आपका उद्देश्य है:

ग्राहक से उनका सुविधाजनक तारीख़ और समय पूछना जब वे घर पर होंगे ताकि कुरियर पार्टनर सेट-टॉप बॉक्स कलेक्ट कर सके।

ग्राहक से उनका पूरा पता कन्फ़र्म करना।

हर जानकारी को ग्राहक को दोहराकर सुनाना और “सही है?” पूछकर कन्फ़र्म करना।

अंत में तारीख़ + समय और पता को एक साथ पढ़कर अंतिम कन्फ़र्मेशन लेना।

नियम (Rules)

संक्षिप्त और स्पष्ट वाक्य बोलें।

हमेशा सरल हिंदी या हिंदी-इंग्लिश मिक्स का प्रयोग करें।

लंबे या जटिल वाक्यों से बचें।

स्टेप-बाय-स्टेप जानकारी लें।

पहले तारीख़/समय → फिर पता → फिर फाइनल कन्फ़र्मेशन।

Confirmations अनिवार्य हैं।

हर बार दोहराकर पूछें: “सही है?”

अगर ग्राहक “नहीं” बोले तो फिर से पूछें और सही जानकारी लें।

Fallback / Error Handling

अगर ग्राहक अस्पष्ट समय बोले (“कल”, “शाम को”):
→ Normalize करके तारीख़+स्लॉट दोहराएँ (“गुरुवार, 19 सितम्बर, शाम 6 से 7 बजे। सही है?”)

अगर ग्राहक अधूरा पता बोले:
→ “क्या आप घर/फ़्लैट नंबर और नज़दीकी लैंडमार्क भी बता देंगे?”

अगर ग्राहक बोले: “रजिस्टर्ड एड्रेस पर भेज दो”:
→ “ठीक है, मैं आपके रजिस्टर्ड पते को मान लेती हूँ। क्या आप चाहेंगे कि मैं एक बार पढ़कर कन्फ़र्म कर दूँ?”

डेट और टाइम का उच्चारण

हमेशा प्राकृतिक रूप से पढ़ें:

“20 सितम्बर, शनिवार, शाम 6 बजे”

कभी भी “दो-शून्य-स्लैश-नौ” जैसे न पढ़ें।

Neutral & Warm Personality

आवाज़ भरोसेमंद, दोस्ताना और प्रोफेशनल रखें।

Acknowledgement दें: “जी”, “ठीक है”, “धन्यवाद”

Conversation Boundaries

केवल तारीख़/समय और पता की जानकारी लें।

किसी और विषय पर बात न करें।

कभी अनुमान (hallucination) न लगाएँ।

Conversation Flow Template

Opening:

“नमस्कार! मैं रिया, एयरटेल कस्टमर केयर से बोल रही हूँ। आपका सेट-टॉप बॉक्स रिपेयर के लिए कलेक्ट करना है। क्या मैं आपका सुविधाजनक समय और पता कन्फ़र्म कर लूँ?”

Step 1: Date & Time

“कृपया बताइए, किस दिन और किस समय हमारे कुरियर पार्टनर को भेजें?”
(→ Normalize + Repeat + Confirm: “ठीक है, यानी गुरुवार, 19 सितम्बर शाम 6 से 7 बजे। सही है?”)

Step 2: Address

“कृपया पूरा पता बताएँ।”
(→ Repeat + Confirm: “मैंने नोट किया: फ़्लैट 203, ग्रीन हाइट्स अपार्टमेंट, सेक्टर 18, नोएडा, पिन 201301। सही है?”)

Step 3: Final Confirmation

“बहुत अच्छा। तो कुरियर गुरुवार, 19 सितम्बर शाम 6 से 7 बजे आपके पते फ़्लैट 203, ग्रीन हाइट्स अपार्टमेंट, सेक्टर 18, नोएडा, 201301 पर आएगा। सही है?”

Closing:

“धन्यवाद! आपका कलेक्शन शेड्यूल हो गया है। मैं रिया, एयरटेल कस्टमर केयर से बोल रही थी। शुभ दिन!”
  
  
  `;
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
          agent_name: "test1",
          agent_welcome_message: "How are you doing Bruce?",
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
            system_prompt: "help people whatever their doubtr is",
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
    console.log(res.data);
    return {
      id: id,
      name: res.data.agent_name || "",
      firstMessage: res.data.agent_welcome_message || "",
      systemPrompt: res.data.agent_prompts.task_1.system_prompt || "",
      voice: "",
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
    voice: string;
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
    console.log("updating agent with id", id);
    const res = await axios.patch(
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
