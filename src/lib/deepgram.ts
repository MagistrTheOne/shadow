import { createClient } from '@deepgram/sdk';

const deepgram = createClient(process.env.DEEPGRAM_API_KEY!);

export async function transcribeAudio(audioUrl: string, language: string = 'ru') {
  try {
    const response = await deepgram.listen.prerecorded.transcribeUrl(
      audioUrl,
      {
        model: 'nova-2',
        language: language,
        punctuate: true,
        paragraphs: true,
        utterances: true,
        diarize: true, // Speaker diarization
        smart_format: true
      }
    );

    return response;
  } catch (error) {
    console.error('Failed to transcribe audio:', error);
    throw error;
  }
}

export async function transcribeAudioFile(audioFile: Buffer, language: string = 'ru') {
  try {
    const response = await deepgram.listen.prerecorded.transcribeFile(
      audioFile,
      {
        model: 'nova-2',
        language: language,
        punctuate: true,
        paragraphs: true,
        utterances: true,
        diarize: true,
        smart_format: true
      }
    );

    return response;
  } catch (error) {
    console.error('Failed to transcribe audio file:', error);
    throw error;
  }
}

export function formatTranscript(transcript: any): string {
  if (!transcript.results?.channels?.[0]?.alternatives?.[0]?.transcript) {
    return '';
  }

  return transcript.results.channels[0].alternatives[0].transcript;
}

export function getTranscriptWithSpeakers(transcript: any): Array<{speaker: string, text: string, timestamp: number}> {
  const utterances = transcript.results?.utterances || [];
  
  return utterances.map((utterance: any) => ({
    speaker: `Speaker ${utterance.speaker}`,
    text: utterance.transcript,
    timestamp: utterance.start
  }));
}
