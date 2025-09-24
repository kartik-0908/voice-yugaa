export interface Voice {
  id: string;
  name: string;
  description: string;
  audioFile: string;
}

export const voices: Voice[] = [
  {
    id: "abhilash",
    name: "Abhilash",
    description: "Indian Male",
    audioFile: "/voices/abhilash.wav",
  },
  {
    id: "anushka",
    name: "Anushka",
    description: "Indian Female",
    audioFile: "/voices/anushka.wav",
  },
  {
    id: "arya",
    name: "Arya",
    description: "Indian Female",
    audioFile: "/voices/arya.wav",
  },
  {
    id: "hitesh",
    name: "Hitesh",
    description: "Indian Male",
    audioFile: "/voices/hitesh.wav",
  },
  {
    id: "karun",
    name: "Karun",
    description: "Indian Male",
    audioFile: "/voices/karun.wav",
  },
  {
    id: "manisha",
    name: "Manisha",
    description: "Indian Female",
    audioFile: "/voices/manisha.wav",
  },
  {
    id: "vidya",
    name: "Vidya",
    description: "Indian Female",
    audioFile: "/voices/vidya.wav",
  },
];