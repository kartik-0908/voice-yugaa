export interface Agent {
  id: string;
  name: string;
  firstMessage: string;
  systemPrompt: string;
  voiceId: string;
  voiceName: string;
}


export interface AgentwithName {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  // userId: string;
}

export interface CallExecution {
  id: string;
  agent_id: string;
  batch_id: string;
  conversation_time: number;
  total_cost: number;
  status: "completed" | "failed" | "in_progress" | "pending";
  error_message?: string;
  answered_by_voice_mail: boolean;
  transcript: string;
  created_at: string;
  updated_at: string;
  cost_breakdown: {
    llm: number;
    network: number;
    platform: number;
    synthesizer: number;
    transcriber: number;
  };
  telephony_data: {
    duration: number;
    to_number: string;
    from_number: string;
    recording_url?: string;
    hosted_telephony: boolean;
    provider_call_id: string;
    call_type: "inbound" | "outbound";
    provider: string;
    hangup_by: string;
    hangup_reason: string;
    hangup_provider_code: number;
  };
  extracted_data?: Record<string, any>;
}

export interface CallHistoryResponse {
  page_number: number;
  page_size: number;
  total: number;
  has_more: boolean;
  data: CallExecution[];
}
