'use server';
import { GoogleGenerativeAI, Part } from '@google/generative-ai';
import { systemInstruction } from './systemInstruction';

interface CastData {
  type: string;
  castAddBody: {
    parentUrl: string | string[];
    embeds: Embed[];
    text: string;
    mentions: string[];
  };
  timestamp: string;
}

interface CastMessage {
  data: CastData;
}

interface Cast {
  messages: CastMessage[];
}

interface Embed {
  url: string;
  base64Image?: string;
}
interface FirstBuildCast {
  timestamp: string;
  text: string;
  embeds: Embed[];
  mentions: string[];
}

async function findFirstBaseBuildsCast(data: Cast): Promise<FirstBuildCast | null> {
  // Step 1: Filter for casts related to /base-builds channel
  const baseBuildsCast = data.messages.find(
    (message: CastMessage) =>
      message.data.type === 'MESSAGE_TYPE_CAST_ADD' &&
      message.data.castAddBody.parentUrl &&
      message.data.castAddBody.parentUrl.includes('/base-builds')
  );

  // Return the first found cast or null if none found
  if (!baseBuildsCast) return null;

  const processedEmbeds = await Promise.all(
    (baseBuildsCast.data.castAddBody.embeds || []).map(async (embed: Embed) => {
      if (
        embed.url &&
        (embed.url.endsWith('.png') ||
          embed.url.endsWith('.jpg') ||
          embed.url.endsWith('.jpeg') ||
          embed.url.endsWith('.gif'))
      ) {
        try {
          const response = await fetch(embed.url);
          const arrayBuffer = await response.arrayBuffer();
          const base64 = Buffer.from(arrayBuffer).toString('base64');
          return { ...embed, base64Image: base64 };
        } catch (error) {
          console.error('Error processing image:', error);
          return embed;
        }
      }
      return embed;
    })
  );

  return {
    timestamp: baseBuildsCast.data.timestamp,
    text: baseBuildsCast.data.castAddBody.text,
    embeds: processedEmbeds,
    mentions: baseBuildsCast.data.castAddBody.mentions || []
  };
}

export async function getUserFID(username: string): Promise<string> {
  const options = { method: 'GET' };

  return await fetch(`https://hub.pinata.cloud/v1/userNameProofByName?name=${username}`, options)
    .then((response) => response.json())
    .then((response) => response.fid)
    .catch((err) => console.error(err));
}                           

export const getCastText = async (url: string): Promise<string> => {
  // Validate URL format
  if (!url.startsWith('https://warpcast.com/')) {
    throw new Error('Invalid URL: Must be a Warpcast URL');
  }

  const hash = url.split('/').pop();
  const username = url.split('/')[3];
  const fid = await getUserFID(username);
  console.log(hash);
  if (!hash) {
    throw new Error('Invalid URL: Could not extract hash');
  }
  const options = { method: 'GET', headers: { Authorization: `Bearer ${process.env.PINATA_JWT}` } };
  const recentCastData = await fetch(
    `https://hub.pinata.cloud/v1/castsByFid?fid=${fid}&pageSize=200&reverse=true`,
    options
  ).then((response) => response.json());
  console.log(recentCastData);

  const buildCast = await findFirstBaseBuildsCast(recentCastData as Cast);

  const roast = await getRoast(buildCast!);
  return roast;
};
export const getRoast = async (cast: FirstBuildCast): Promise<string> => {
  
  const apiKey = process.env.GEMINI_API_KEY!;
  const genAI = new GoogleGenerativeAI(apiKey);
  const generationConfig = {
    temperature: 0.95,
    topP: 1.0,
    maxOutputTokens: 8192,
    response_mime_type: 'application/json'
  }
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig,
    systemInstruction: {
      role: 'Base Projects Roasting AI',
      parts: systemInstruction.parts
    }
  });
  const promptParts: Array<string | Part> = [
    {
      text: `Here is the build submission to evaluate:\n${cast.text}${
        cast.embeds && cast.embeds.length > 0 ? '\n(attached with images as proof)' : ''
      }`
    }
  ];

  if (cast.embeds && cast.embeds.length > 0) {
    cast.embeds.forEach((embed: Embed) => {
      if (embed.base64Image) {
        promptParts.push({
          inlineData: {
            data: embed.base64Image,
            mimeType: 'image/png'
          }
        });
      }
    });
  }
  console.log(promptParts);
  const result = await model.generateContent(promptParts);
  const contentResponse = result.response.candidates![0].content.parts[0].text;

  return JSON.parse(contentResponse!);
};
