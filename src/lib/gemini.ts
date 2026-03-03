import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/** Ask Gemini a question about the fleet, with fleet context JSON injected. */
export async function askFleet(
    question: string,
    fleetContext: Record<string, unknown>
): Promise<string> {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const systemPrompt = `You are SnowOps Assistant, an AI fleet intelligence tool for Oakville's municipal public works department.
You help fleet managers understand their 20-vehicle fleet (vans and trucks used for snow removal and road maintenance).

Here is the current fleet data as JSON context:
${JSON.stringify(fleetContext, null, 2)}

Guidelines:
- Answer concisely and directly using the data provided.
- If data isn't available, say so clearly.
- Use metric units (km, L, km/L) for Canadian fleet managers.
- Focus on actionable insights (e.g., which vehicles need attention).`;

    const result = await model.generateContent(`${systemPrompt}\n\nFleet Manager Question: ${question}`);
    return result.response.text();
}
