"use client";

import { useFormStatus } from "react-dom";
import { useRef } from "react";

interface CreateAgentFormProps {
  action: (formData: FormData) => Promise<void>;
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center gap-2"
    >
      {pending ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          Creating...
        </>
      ) : (
        "Create Agent"
      )}
    </button>
  );
}

export default function CreateAgentForm({ action }: CreateAgentFormProps) {
  const formRef = useRef<HTMLFormElement>(null);

  const handleAction = async (formData: FormData) => {
    await action(formData);
    // Reset form after successful submission
    formRef.current?.reset();
  };

  return (
    <form ref={formRef} action={handleAction} className="space-y-4">
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
        <SubmitButton />
      </div>
    </form>
  );
}