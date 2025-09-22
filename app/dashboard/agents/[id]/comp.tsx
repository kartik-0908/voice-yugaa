"use client";

import { useState, useTransition } from "react";
import { initiateCallfromAgent, updateAgent } from "@/app/actions/agents";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Loader2,
  Save,
  User,
  MessageCircle,
  Settings,
  Volume2,
  Phone,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Agent } from "@/lib/types";

// Voice options for the agent
const VOICE_OPTIONS = [
  { value: "alloy", label: "Alloy" },
  { value: "echo", label: "Echo" },
  { value: "fable", label: "Fable" },
  { value: "onyx", label: "Onyx" },
  { value: "nova", label: "Nova" },
  { value: "shimmer", label: "Shimmer" },
];

// Country codes for phone numbers
const COUNTRY_CODES = [
  { code: "+1", country: "US/CA", flag: "🇺🇸" },
  { code: "+44", country: "UK", flag: "🇬🇧" },
  { code: "+91", country: "IN", flag: "🇮🇳" },
  { code: "+86", country: "CN", flag: "🇨🇳" },
  { code: "+81", country: "JP", flag: "🇯🇵" },
  { code: "+49", country: "DE", flag: "🇩🇪" },
  { code: "+33", country: "FR", flag: "🇫🇷" },
  { code: "+61", country: "AU", flag: "🇦🇺" },
  { code: "+55", country: "BR", flag: "🇧🇷" },
  { code: "+7", country: "RU", flag: "🇷🇺" },
  { code: "+82", country: "KR", flag: "🇰🇷" },
  { code: "+39", country: "IT", flag: "🇮🇹" },
  { code: "+34", country: "ES", flag: "🇪🇸" },
  { code: "+31", country: "NL", flag: "🇳🇱" },
  { code: "+46", country: "SE", flag: "🇸🇪" },
  { code: "+41", country: "CH", flag: "🇨🇭" },
  { code: "+65", country: "SG", flag: "🇸🇬" },
  { code: "+971", country: "AE", flag: "🇦🇪" },
  { code: "+966", country: "SA", flag: "🇸🇦" },
  { code: "+52", country: "MX", flag: "🇲🇽" },
];

interface AgentCustomizationProps {
  agent: Agent;
}

export function AgentCustomizationForm({ agent }: AgentCustomizationProps) {
  const [isPending, startTransition] = useTransition();
  const [isTestCallPending, setIsTestCallPending] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [countryCode, setCountryCode] = useState("+1");
  const [mobileNumber, setMobileNumber] = useState("");

  const [formData, setFormData] = useState({
    name: agent.name || "",
    firstMessage: agent.firstMessage || "",
    systemPrompt: agent.systemPrompt || "",
    voice: agent.voice || "alloy",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    startTransition(async () => {
      try {
        // Call your update agent action
        await updateAgent(agent.id, formData);

        toast.success("Agent settings have been updated successfully.");
      } catch (error) {
        toast.error("Failed to update agent settings. Please try again.");
      }
    });
  };

  const triggerTestCall = async (fullPhoneNumber: string) => {
    setIsTestCallPending(true);
    try {
      // TODO: Replace with your actual API call function
      // Example: await initiateTestCall(agent.id, fullPhoneNumber);

      // Simulating API call
      await initiateCallfromAgent(agent.id, fullPhoneNumber);
      //   await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.success(`Test call initiated to ${fullPhoneNumber}`);
      setIsDialogOpen(false);
      setMobileNumber("");
      setCountryCode("+1");
    } catch (error) {
      toast.error("Failed to initiate test call. Please try again.");
    } finally {
      setIsTestCallPending(false);
    }
  };

  const handleTestCallSubmit = () => {
    if (!mobileNumber.trim()) {
      toast.error("Please enter a valid mobile number.");
      return;
    }

    // Basic mobile number validation (digits only, reasonable length)
    const cleanNumber = mobileNumber.replace(/[\s\-\(\)]/g, "");
    const numberRegex = /^\d{7,15}$/;
    if (!numberRegex.test(cleanNumber)) {
      toast.error("Please enter a valid mobile number (7-15 digits).");
      return;
    }

    const fullPhoneNumber = `${countryCode}${cleanNumber}`;
    triggerTestCall(fullPhoneNumber);
  };

  const hasChanges =
    formData.name !== agent.name ||
    formData.firstMessage !== agent.firstMessage ||
    formData.systemPrompt !== agent.systemPrompt ||
    formData.voice !== agent.voice;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Agent Customization
          </h1>
          <p className="text-muted-foreground">
            Customize your agent`&apos;`s behavior, voice, and personality.
          </p>
        </div>

        {/* Test Agent Button */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Test Agent
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Test Your Agent
              </DialogTitle>
              <DialogDescription>
                Enter your mobile number to receive a test call from your agent.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="phone-input">Mobile Number</Label>
                <div className="flex gap-2">
                  {/* Country Code Dropdown */}
                  <Select value={countryCode} onValueChange={setCountryCode}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-48">
                      {COUNTRY_CODES.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          <div className="flex items-center gap-2">
                            <span>{country.flag}</span>
                            <span className="font-mono text-sm">
                              {country.code}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {country.country}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Mobile Number Input */}
                  <Input
                    id="phone-input"
                    type="tel"
                    placeholder="1234567890"
                    value={mobileNumber}
                    onChange={(e) => {
                      // Only allow digits, spaces, hyphens, and parentheses
                      const value = e.target.value.replace(
                        /[^\d\s\-\(\)]/g,
                        ""
                      );
                      setMobileNumber(value);
                    }}
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter your mobile number without the country code
                </p>
                {mobileNumber && (
                  <div className="text-sm text-muted-foreground bg-muted/50 p-2 rounded-md border">
                    Complete number:{" "}
                    <span className="font-mono">
                      {countryCode}
                      {mobileNumber.replace(/[\s\-\(\)]/g, "")}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  setMobileNumber("");
                  setCountryCode("+1");
                }}
                disabled={isTestCallPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleTestCallSubmit}
                disabled={isTestCallPending || !mobileNumber.trim()}
              >
                {isTestCallPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Calling...
                  </>
                ) : (
                  <>
                    <Phone className="mr-2 h-4 w-4" />
                    Start Test Call
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Separator />

      {/* Basic Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Basic Information
          </CardTitle>
          <CardDescription>
            Configure the basic settings for your agent.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="agent-name">Agent Name</Label>
            <Input
              id="agent-name"
              placeholder="Enter agent name..."
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="max-w-md"
            />
          </div>
        </CardContent>
      </Card>

      {/* Conversation Settings Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Conversation Settings
          </CardTitle>
          <CardDescription>
            Set how your agent introduces itself and starts conversations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="first-message">First Message</Label>
            <Textarea
              id="first-message"
              placeholder="Enter the first message your agent will send..."
              value={formData.firstMessage}
              onChange={(e) =>
                handleInputChange("firstMessage", e.target.value)
              }
              rows={3}
              className="resize-none"
            />
            <p className="text-sm text-muted-foreground">
              This message will be shown when users first interact with your
              agent.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* System Prompt Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            System Prompt
          </CardTitle>
          <CardDescription>
            Define your agent`&apos;`s personality, behavior, and capabilities.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="system-prompt">System Prompt</Label>
            <Textarea
              id="system-prompt"
              placeholder="Enter detailed instructions for your agent's behavior..."
              value={formData.systemPrompt}
              onChange={(e) =>
                handleInputChange("systemPrompt", e.target.value)
              }
              rows={8}
              className="resize-none font-mono text-sm"
            />
            <p className="text-sm text-muted-foreground">
              Be specific about how you want your agent to respond and behave.
              This is the core instruction that guides all interactions.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Voice Settings Card */}
      {/* <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            Voice Settings
          </CardTitle>
          <CardDescription>
            Choose the voice for your agent's audio responses.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="voice-select">Voice</Label>
            <Select
              value={formData.voice}
              onValueChange={(value) => handleInputChange("voice", value)}
            >
              <SelectTrigger className="max-w-md">
                <SelectValue placeholder="Select a voice" />
              </SelectTrigger>
              <SelectContent>
                {VOICE_OPTIONS.map((voice) => (
                  <SelectItem key={voice.value} value={voice.value}>
                    {voice.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              The selected voice will be used when your agent provides audio
              responses.
            </p>
          </div>
        </CardContent>
      </Card> */}

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 pt-6">
        {/* <Button
          variant="outline"
          onClick={() => {
            setFormData({
              name: agent.name || "",
              firstMessage: agent.firstMessage || "",
              systemPrompt: agent.systemPrompt || "",
              voice: agent.voice || "alloy",
            });
          }}
          disabled={isPending || !hasChanges}
        >
          Reset Changes
        </Button> */}
        <Button onClick={handleSave} disabled={isPending || !hasChanges}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
