import { NextRequest, NextResponse } from 'next/server';
import { askFleet } from '@/lib/gemini';

export async function POST(req: NextRequest) {
    try {
        const { question, context } = await req.json();
        if (!question) return NextResponse.json({ error: 'No question provided' }, { status: 400 });
        const answer = await askFleet(question, context || {});
        return NextResponse.json({ answer });
    } catch (err: unknown) {
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}
