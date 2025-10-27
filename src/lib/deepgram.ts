import { createClient, DeepgramClient } from '@deepgram/sdk';

export interface TranscriptResult {
  transcript: string;
  confidence: number;
  words: Array<{
    word: string;
    start: number;
    end: number;
    confidence: number;
    speaker?: number;
  }>;
  speakers?: number;
}

export async function transcribeAudio(
  fileUrl: string, 
  language: 'ru' | 'en' = 'ru'
): Promise<TranscriptResult> {
  try {
    // Fetch the file first
    const response = await fetch(fileUrl);
    const audioBuffer = await response.arrayBuffer();
    
    const result = await deepgramClient.listen.prerecorded.transcribeFile(
      Buffer.from(audioBuffer),
      {
        model: 'nova-2',
        language: language === 'ru' ? 'ru' : 'en',
        punctuate: true,
        paragraphs: true,
        utterances: true,
        diarize: true,
        smart_format: true,
      }
    );

    // Simplified response handling - return empty result for now
    return {
      transcript: '',
      confidence: 0,
      words: [],
      speakers: 1,
    };
  } catch (error) {
    console.error('Deepgram transcription error:', error);
    throw new Error(`Transcription failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function formatTranscript(result: TranscriptResult): string {
  if (!result.transcript) {
    return '';
  }

  // Если есть информация о спикерах, форматируем с указанием говорящего
  if (result.speakers && result.speakers > 1) {
    const utterances = result.words.reduce((acc, word) => {
      const speaker = word.speaker || 0;
      if (!acc[speaker]) {
        acc[speaker] = [];
      }
      acc[speaker].push(word.word);
      return acc;
    }, {} as Record<number, string[]>);

    return Object.entries(utterances)
      .map(([speaker, words]) => `Спикер ${parseInt(speaker) + 1}: ${words.join(' ')}`)
      .join('\n\n');
  }

  return result.transcript;
}

export async function transcribeStream(
  stream: ReadableStream,
  language: 'ru' | 'en' = 'ru'
): Promise<TranscriptResult> {
  try {
    // Simplified streaming implementation
    return {
      transcript: '',
      confidence: 0,
      words: [],
      speakers: 1,
    };
  } catch (error) {
    console.error('Deepgram streaming transcription error:', error);
    throw new Error(`Streaming transcription failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Initialize Deepgram client
export const deepgramClient: DeepgramClient = createClient(process.env.DEEPGRAM_API_KEY!);