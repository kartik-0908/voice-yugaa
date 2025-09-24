"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Play, Pause, Volume2 } from "lucide-react";
import { Voice, voices } from "@/lib/voices";



export default function VoiceLibrary() {
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playVoice = async (voice: Voice) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }

    if (currentlyPlaying === voice.id && isPlaying) {
      // Pause if same voice is already playing
      setIsPlaying(false);
      setCurrentlyPlaying(null);
      return;
    }

    try {
      const audio = new Audio(voice.audioFile);
      audioRef.current = audio;

      audio.addEventListener("ended", () => {
        setIsPlaying(false);
        setCurrentlyPlaying(null);
      });

      audio.addEventListener("error", (e) => {
        console.error("Audio playback error:", e);
        setIsPlaying(false);
        setCurrentlyPlaying(null);
      });

      await audio.play();
      setCurrentlyPlaying(voice.id);
      setIsPlaying(true);
    } catch (error) {
      console.error("Error playing audio:", error);
      setIsPlaying(false);
      setCurrentlyPlaying(null);
    }
  };

  const stopAllPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentlyPlaying(null);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
          <Volume2 className="h-8 w-8" />
          Voice Library
        </h1>
        <p className="text-muted-foreground">
          Choose from our collection of high-quality voices
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {voices.map((voice) => (
          <Card key={voice.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{voice.name}</CardTitle>
              <CardDescription>{voice.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => playVoice(voice)}
                variant={
                  currentlyPlaying === voice.id && isPlaying
                    ? "secondary"
                    : "default"
                }
                className="w-full flex items-center gap-2"
                disabled={
                  currentlyPlaying !== null &&
                  currentlyPlaying !== voice.id &&
                  isPlaying
                }
              >
                {currentlyPlaying === voice.id && isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                {currentlyPlaying === voice.id && isPlaying
                  ? "Pause"
                  : "Play Sample"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {currentlyPlaying && (
        <div className="fixed bottom-4 right-4">
          <Button onClick={stopAllPlayback} variant="outline" size="sm">
            Stop All
          </Button>
        </div>
      )}
    </div>
  );
}
