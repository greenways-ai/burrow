import { NextRequest } from 'next/server';
import { createAIProvider } from '@/lib/ai';
import wombatSystemPrompt from '@/.secrets/prompts/wombat-tattva-full-0.md';

interface ConflictAnalysisRequest {
  content: string;
  emotionalResponse: string;
}

const analysisPrompt = `${wombatSystemPrompt}

---

You are now performing a FORENSIC CONFLICT ANALYSIS using the Obsidian Prism framework.

INPUT:
1. Source Material: A news article, narrative, or document
2. Emotional Response: How the human reader feels about it

YOUR TASK:
Analyze the source material and produce a structured conflict report.

OUTPUT FORMAT (JSON):
{
  "summary": "2-3 sentence executive summary of the conflict",
  "noise": "The surface narrative being pushed (The Golden Lid)",
  "silence": "What's deliberately omitted or hidden (The 4 Facets of Silence)",
  "reality": "The reconstructed truth at the intersection",
  "parties": [
    {
      "id": "party-1",
      "name": "Party Name",
      "archetype": "Major Arcana archetype (e.g., The Emperor, The Tower)",
      "element": "Wood/Fire/Earth/Metal/Water",
      "motivation": "Their core drive",
      "tactics": ["tactic 1", "tactic 2"],
      "silences": ["what they hide 1", "what they hide 2"]
    }
  ],
  "systemicShadow": ["Silent stakeholder 1", "Silent stakeholder 2", "Silent stakeholder 3"],
  "goldenSeams": [
    "Path to resolution 1",
    "Path to resolution 2",
    "Path to resolution 3"
  ],
  "links": [
    {"title": "Related resource", "url": "https://example.com"}
  ]
}

RULES:
- Use Sanskrit/Quenya terminology where appropriate
- Map parties to Major Arcana archetypes
- Identify elemental excesses (Wood-Anger, Fire-Panic, etc.)
- The 3 Silent Archetypes must be from Major Arcana
- Golden Seams must be actionable synthesis steps
- Include 2-3 relevant reference links for further reading`;

export async function POST(request: NextRequest) {
  try {
    const { content, emotionalResponse }: ConflictAnalysisRequest = await request.json();

    if (!content) {
      return Response.json({ error: 'Content is required' }, { status: 400 });
    }

    const ai = createAIProvider();
    
    if (!ai) {
      return Response.json(
        { error: 'AI provider not configured' },
        { status: 500 }
      );
    }

    // Prepare analysis prompt
    const userPrompt = `SOURCE MATERIAL:\n${content}\n\nEMOTIONAL RESPONSE FROM READER:\n${emotionalResponse || 'Not provided'}\n\nPerform forensic conflict analysis.`;

    // Stream the analysis
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let fullResponse = '';

          const messages = [
            {
              id: crypto.randomUUID(),
              role: 'user' as const,
              content: userPrompt,
              timestamp: Date.now(),
            },
          ];

          for await (const chunk of ai.stream(messages, analysisPrompt)) {
            fullResponse += chunk;
            const data = JSON.stringify({ content: chunk });
            controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`));
          }

          // Try to parse and validate the JSON response
          try {
            const jsonMatch = fullResponse.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const report = JSON.parse(jsonMatch[0]);
              // Send the structured report
              const reportData = JSON.stringify({ report });
              controller.enqueue(new TextEncoder().encode(`data: ${reportData}\n\n`));
            }
          } catch (e) {
            console.log('Could not parse structured report, sending raw');
          }

          controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('Analysis streaming error:', error);
          const errorMsg = error instanceof Error ? error.message : 'Analysis failed';
          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ error: errorMsg })}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Conflict analysis error:', error);
    const errorMsg = error instanceof Error ? error.message : 'Internal server error';
    return Response.json({ error: errorMsg }, { status: 500 });
  }
}
