import Anthropic from "npm:@anthropic-ai/sdk@0.52.0"

const CRITERIA: Record<string, { name: string; weight: number }[]> = {
  "comite-direction": [
    { name: "Clarté de la demande de décision", weight: 30 },
    { name: "Argumentation et données", weight: 25 },
    { name: "Synthèse et concision", weight: 20 },
    { name: "Prochaines étapes", weight: 15 },
    { name: "Qualité formelle", weight: 10 },
  ],
  "kick-off": [
    { name: "Contexte et objectifs", weight: 25 },
    { name: "Gouvernance et rôles", weight: 20 },
    { name: "Planning et jalons", weight: 25 },
    { name: "Risques identifiés", weight: 15 },
    { name: "Règles de fonctionnement", weight: 15 },
  ],
  "revue-projet": [
    { name: "Statut synthétique", weight: 25 },
    { name: "Avancement vs planning", weight: 25 },
    { name: "Points bloquants", weight: 20 },
    { name: "Prochaines étapes", weight: 20 },
    { name: "Qualité formelle", weight: 10 },
  ],
  commercial: [
    { name: "Connaissance du prospect", weight: 20 },
    { name: "Proposition de valeur", weight: 30 },
    { name: "Storytelling", weight: 20 },
    { name: "Call to action", weight: 15 },
    { name: "Qualité formelle", weight: 15 },
  ],
  formation: [
    { name: "Objectifs pédagogiques", weight: 25 },
    { name: "Progression logique", weight: 25 },
    { name: "Clarté des explications", weight: 20 },
    { name: "Exercices et interactions", weight: 15 },
    { name: "Récapitulatif", weight: 15 },
  ],
  autre: [
    { name: "Objectifs clairs", weight: 25 },
    { name: "Structure logique", weight: 25 },
    { name: "Prochaines étapes", weight: 20 },
    { name: "Pertinence du contenu", weight: 20 },
    { name: "Qualité formelle", weight: 10 },
  ],
}

function buildPrompt(
  slides: { number: number; title: string; content: string }[],
  meetingType: string,
  audience: string | null,
  lang: string
) {
  const criteria = CRITERIA[meetingType] || CRITERIA["autre"]

  const slidesText = slides
    .map(
      (s) =>
        `--- Slide ${s.number} ---\nTitre: ${s.title}\nContenu:\n${s.content}`
    )
    .join("\n\n")

  const isEn = lang === "en"

  return `${
    isEn
      ? "You are an expert in professional communication and PowerPoint presentation design. Reply entirely in English."
      : "Tu es un expert en communication professionnelle et en conception de présentations PowerPoint. Réponds entièrement en français."
  }

${isEn ? "Analyze this presentation of type" : "Analyse cette présentation de type"} "${meetingType}"${
    audience
      ? ` ${isEn ? "for audience" : "destinée à une audience"} "${audience}"`
      : ""
  }.

${isEn ? "Here is the extracted content from each slide:" : "Voici le contenu extrait des slides :"}

${slidesText}

${isEn ? "Criteria grid to use:" : "Grille de critères à utiliser :"}
${criteria.map((c) => `- ${c.name} (${isEn ? "weight" : "pondération"}: ${c.weight}%)`).join("\n")}

${
  isEn
    ? "Return a JSON response strictly matching this structure"
    : "Fournis une réponse JSON strictement conforme à cette structure"
} :

{
  "overallScore": <number 0-5>,
  "criteriaScores": [
    {
      "name": "<criterion name>",
      "score": <number 0-5>,
      "weight": <number>,
      "rationale": "<detailed justification>",
      "slidesReferenced": ["Slide X", ...]
    }
  ],
  "strengths": ["...", "...", "..."],
  "improvements": ["...", "...", "..."],
  "suggestions": [
    {
      "type": "reformulation" | "add-slide" | "remove-slide" | "reorganize",
      "slideRef": "<Slide X>",
      "before": "<original text>",
      "after": "<improved text>",
      "description": "<description>"
    }
  ],
  "encouragement": "<personalized encouragement message>",
  "improvedSlides": [
    {
      "slideNumber": <number>,
      "replacements": [
        {
          "original": "<exact original text as extracted>",
          "improved": "<improved text>"
        }
      ]
    }
  ]
}

IMPORTANT:
- "original" ${
    isEn
      ? "must match EXACTLY the text extracted from the slides above"
      : "doit correspondre EXACTEMENT au texte extrait des slides ci-dessus"
  }
- ${
    isEn
      ? "Only suggest replacements when genuinely useful"
      : "Ne propose des remplacements que quand c'est utile"
  }
- ${
    isEn
      ? "Keep an appropriate tone for the meeting type"
      : "Garde le ton approprié pour le type de réunion"
  }
- ${
    isEn
      ? "Improve clarity, impact, and structure"
      : "Améliore la clarté, l'impact et la structure"
  }

${
  isEn
    ? "Reply ONLY with the JSON, no text before or after."
    : "Réponds UNIQUEMENT avec le JSON, sans aucun texte avant ou après."
}`
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { slides, meetingType, audience, lang } = await req.json()

    if (!slides || !meetingType) {
      return new Response(
        JSON.stringify({ error: "slides and meetingType are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const anthropic = new Anthropic()
    const prompt = buildPrompt(slides, meetingType, audience, lang || "fr")

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8000,
      messages: [{ role: "user", content: prompt }],
    })

    const responseText = message.content[0].type === "text" ? message.content[0].text : ""

    let analysis
    try {
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/)
      analysis = JSON.parse(jsonMatch ? jsonMatch[1] : responseText)
    } catch {
      return new Response(
        JSON.stringify({ error: "Failed to parse AI response" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message || "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
