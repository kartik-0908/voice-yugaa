import axios from "axios";
import { getAuthToken } from "./authToken";

export async function getAllvoices(language: string) {
  const token = await getAuthToken();
  const res = await axios.get(
    `https://api.superflow.run/b2b/vocallabs/getVoicesByLanguageComment?language=${language}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  const data = res.data;
//   console.log(data);
  return data.data.vocallabs_tts_voices;
}
