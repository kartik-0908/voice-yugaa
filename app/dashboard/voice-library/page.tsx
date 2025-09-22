import { getAllvoices } from "@/app/actions/voices";

export default async function Page() {
  const englishVoices = await getAllvoices("ENGLISH");
  const hindiVoices = await getAllvoices("HINDI");
//   const englishHindiVoices = await getAllvoices("ENGLISH-INDIA");

  // Filter voices that have preview available
  const englishWithPreview = englishVoices.filter(
    (voice: any) => voice.voice_preview
  );
  const hindiWithPreview = hindiVoices.filter(
    (voice: any) => voice.voice_preview
  );
//   const englishHindiWithPreview = englishHindiVoices.filter(
//     (voice: any) => voice.voice_preview
//   );

  const VoiceCard = ({ voice }: any) => (
    <div key={voice.id} className="border rounded-lg p-4 shadow-sm">
      <h3 className="font-semibold mb-2">{voice.name}</h3>
      <div className="space-y-1 text-sm text-gray-600">
        <p>
          <span className="font-medium">Gender:</span> {voice.gender}
        </p>
        <p>
          <span className="font-medium">Language:</span> {voice.language.value}
        </p>
      </div>
      <audio controls className="w-full mt-3">
        <source src={voice.voice_preview} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
    </div>
  );

  return (
    <div className="p-6 space-y-8">
      {/* English Voices */}
      <section>
        <h1 className="text-2xl font-bold mb-4">English Voices</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {englishWithPreview.map((voice: any) => (
            <VoiceCard key={voice.id} voice={voice} />
          ))}
        </div>
      </section>

      {/* Hindi Voices */}
      <section>
        <h1 className="text-2xl font-bold mb-4">Hindi Voices</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {hindiWithPreview.map((voice: any) => (
            <VoiceCard key={voice.id} voice={voice} />
          ))}
        </div>
      </section>

      {/* English-Hindi Voices */}
      {/* <section>
        <h1 className="text-2xl font-bold mb-4">English-Hindi Voices</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {englishHindiWithPreview.map((voice: any) => (
            <VoiceCard key={voice.id} voice={voice} />
          ))}
        </div>
      </section> */}
    </div>
  );
}
