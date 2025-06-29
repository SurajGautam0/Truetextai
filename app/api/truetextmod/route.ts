import { NextResponse } from 'next/server';
import { systemPrompt } from '../../utils/instr';
import { writingSamples } from '../../utils/samples';

export async function POST(request: Request) {
    try {
        const { aiText } = await request.json();
        if (!aiText) {
            return NextResponse.json({ error: 'No text provided' }, { status: 400 });
        }

        // Format the prompt for Mistral
        const formattedPrompt = `
${systemPrompt}

Examples:
${writingSamples.map(sample => 
    `${sample.role === 'user' ? 'Input:' : 'Output:'} ${sample.content}`
).join('\n')}

Input: ${aiText}
Output:`;

        const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'mistral',
                prompt: formattedPrompt,
                stream: false,
                options: {
                    temperature: 0.7,
                    top_p: 0.9,
                    max_tokens: 2000
                }
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            return NextResponse.json({ 
                error: 'Failed to generate response', 
                details: errorData 
            }, { status: response.status });
        }

        const data = await response.json();
        const generatedText = data.response || 'No response available';

        return NextResponse.json({ message: generatedText });
    } catch (error) {
        console.error('Error in truetextmod API:', error);
        return NextResponse.json({ 
            error: 'An error occurred while processing your request',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
} 