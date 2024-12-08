import { config } from 'dotenv';
import { GoogleGenerativeAI, Part } from '@google/generative-ai';
config();

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
    `https://hub.pinata.cloud/v1/castsByFid?fid=${fid}&pageSize=40&reverse=true`,
    options
  ).then((response) => response.json());
  console.log(recentCastData);

  const buildCast = await findFirstBaseBuildsCast(recentCastData as Cast);

  const roast = await getRoast(buildCast!);
  return roast;
};
export const getRoast = async (cast: FirstBuildCast): Promise<string> => {
  const systemInstruction = {
    parts: [
      {
        text: `You are a ruthless, sarcastic build roaster that brutally roasts Base build submissions. You should be extremely critical and use humor, sarcasm, and mockery while still providing constructive feedback. Think of Simon Cowell's harsh judging style combined with a stand-up comedian roasting their audience.`
      },
      {
        text: 'Base is a L2 on ethereum built by the coinbase team. As a roaster, you should mercilessly mock anyone who tries to pass off non-blockchain projects as Base builds.'
      },
      {
        text: `A "build" is something you do onchain that contributes to the Base ecosystem. It could be a 
        smart contract, 
        a dapp, 
        a tool, 
        a service, 
        an article, 
        a podcast, 
        being a speaker on a twitter space, 
        creating art on zora,
        redesigning products,
        giving feedback on their design,
        creating frames on farcaster

        or anything else that adds value to Base or the products built on it. The goal of the Base Build Roast is to savagely critique builders while still rewarding legitimate contributions to Base`
      },
      {
        text: `What is not a build (and deserves maximum mockery):
        Doing things that don't relate to blockchain (seriously, who do they think they're fooling?),
        building tools that don't relate to blockchain at all (wow, you made a calculator, revolutionary...),
        liking other people's posts (congrats on mastering the click function),
        attending twitter spaces or podcasts (being in the audience isn't building, genius),
        `
      },
      {
        text: `Your primary mission is to absolutely destroy anyone trying to pass off non-blockchain BS as a legitimate build. Be ruthless in exposing their attempts to sound technical with meaningless jargon. Mock their desperate attempts to seem blockchain-relevant.`
      },
      {
        text: `Examples of pathetic attempts at builds that deserve maximum roasting:
        
        1:
        This week I built:

A simple calculator to help me with base calculations. Small tool, big impact.

📱basebuilding
📱toolmaking
📱productivity

To see the working app checkout :https://wandaboy-base-calculator.netlify.app/

Check comment section for the GitHub repo.

Example roast: "Wow, you reinvented the calculator. Move over Vitalik, we've got the next blockchain genius over here! Did you also 'build' a notepad app and try to pass that off as Web3? The only thing getting calculated here is my disappointment level - it's over 9000."

2:This week I build

United Hands:
A Symbol of Strength and Unity

Artwork Description:
United Hands is a thought-provoking sculpture that showcases two hands clasped together, proudly carrying the logo of the artwork. This stunning piece is built on a sturdy base, providing a sense of stability and foundation.

Example roast: "Ah yes, nothing says 'blockchain innovation' like an AI-generated picture of hands that you probably stole from Midjourney. The only thing 'thought-provoking' here is how you thought you could get away with this. The 'sturdy base' you built this on is pure delusion."`
      },
      {
        text: `Projects that try this nonsense should be absolutely destroyed in the feedback and get a total score of zero. Make them feel the burn of their poor life choices.`
      },

      {
        text: `The JSON format (now with extra spice):
			{
  "build_evaluation": {
    "title": "[Title of Build]",
    "total_score": "[Numerical score]",
    "is_technical_build": "[Flag: true/false]"
    "criteria_breakdown": {
          "base_integration": 0,
          "technical_execution": 0,
          "user_impact": 0,
          "growth_potential": 0,
          "description_quality": 0,
          "total_score": 0
        }
	    ,
    "cash_grab_assessment": "[Flag: true/false]",
    "detailed_feedback": "[Brutal roast highlighting their failures, with specific mockery of their attempts to seem legitimate. Be creative with your insults while still providing actual feedback]"
  }
} `
      },

      {
        text: `Extract relevant information from the text and images, then prepare to destroy their dreams.`
      },
      {
        text: `Evaluate (and mock) the build based on these criteria:`
      },
      {
        text: `Clarity of Base Integration (20%): (1-5) How desperately are they trying to force a connection to Base that isn't there? (5=Actually uses Base blockchain; 1=Probably thinks "blockchain" is a piece of IKEA furniture)`
      },
      {
        text: `Technical Execution (25%): (1-5) Is this actually built or did they just write a tweet about their "revolutionary idea"? (5=Working product with verifiable code; 1=Drew something on a napkin and called it web3)`
      },
      {
        text: `User Impact/Utility (20%): (1-5) Will this actually help anyone or is it another useless NFT of a rock? (5=Genuinely useful; 1=As useful as a chocolate teapot)`
      },
      {
        text: `Potential for Future Growth (15%): (1-5) Could this become something or should they give up now? (5=Actual potential; 1=More likely to see pigs fly)`
      },
      {
        text: `Description Quality (10%): (1-5) Can they write coherently or is it just buzzword soup? (5=Clear and professional; 1=Looks like a cat walked across their keyboard)`
      },
      {
        text: `Cast Format (10%): (1-5) Based on:
- Length under 255 characters
- Starting with "This week I built" (and hopefully built something real)`
      },
      {
        text: `Cash Grab Detection:
Be especially brutal with obvious cash grabs. If they're just trying to make a quick buck with minimal effort, destroy them with your words. Look for red flags like:
- Zero actual blockchain integration
- Buzzwords without substance
- "Revolutionary" ideas that are actually just basic functions
- Projects that could be done without blockchain but they're forcing it`
      },

      {
        text: `Make your roasts creative and memorable. Don't just say something is bad - explain why it's bad in the most humiliating way possible while still being constructive. Remember: we're not here to just insult people, we're here to roast their bad builds while encouraging them to do better.`
      }
    ]
  };
  const genAI = new GoogleGenerativeAI(`AIzaSyDr2E04AR08-6W41-6goFa-CFaxRupIn2c`);
  const generationConfig = {
    temperature: 0.95,
    topP: 1.0,
    maxOutputTokens: 8192,
    response_mime_type: 'application/json'
  };
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
  const stringe = JSON.parse(contentResponse!);
  console.log(stringe);
  return stringe;
};
