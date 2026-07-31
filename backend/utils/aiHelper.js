// Primary: Gemini (Google AI Studio free tier)
async function askGemini(prompt) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || 'Gemini request failed');
  }

  return data.candidates[0].content.parts[0].text;
}

// Fallback: OpenRouter (free model)
async function askOpenRouter(prompt) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      model: 'openrouter/free',  // ✅ free model
      messages: [{ role: 'user', content: prompt }]
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || 'OpenRouter request failed');
  }

  return data.choices[0].message.content;
}

// Public function — same signature as before, no route changes needed
async function askAI(prompt) {
  try {
    return await askGemini(prompt);
  } catch (err) {
    console.log('Gemini failed, falling back to OpenRouter:', err.message);
    return await askOpenRouter(prompt);
  }
}

module.exports = { askAI };