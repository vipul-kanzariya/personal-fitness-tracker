const AI_REQUEST_TIMEOUT_MS = 10000;

async function fetchWithTimeout(url, options) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AI_REQUEST_TIMEOUT_MS);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("AI nutrition request timed out");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

// Primary: Gemini (Google AI Studio free tier)
async function askGemini(prompt) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const response = await fetchWithTimeout(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
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
 if (!process.env.OPENROUTER_API_KEY) {
   throw new Error("OPENROUTER_API_KEY is not configured");
 }

 const response = await fetchWithTimeout('https://openrouter.ai/api/v1/chat/completions', {
method: 'POST',
headers: {
Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
'Content-Type': 'application/json'
},
body: JSON.stringify({ model: 'openrouter/free', messages: [{ role: 'user', content: prompt }] })
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