export async function askGemini(prompt) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    console.warn('Gemini API key is not set. Returning placeholder response.');
    // Return a placeholder instead of throwing error
    return `[Gemini API key not configured] This is a placeholder response. To enable AI features, please add VITE_GEMINI_API_KEY to your .env file.`;
  }

  try {
    // Try different model/version combinations
    // Prioritize gemini-1.5-flash with v1beta first, then v1
    // Fallback to other models if needed
    const models = [
      { model: 'gemini-1.5-flash', version: 'v1beta' },
      { model: 'gemini-1.5-flash', version: 'v1' },
      { model: 'gemini-2.0-flash-exp', version: 'v1beta' },
      { model: 'gemini-2.0-flash-exp', version: 'v1' },
      { model: 'gemini-1.5-pro', version: 'v1beta' },
      { model: 'gemini-1.5-pro', version: 'v1' },
      { model: 'gemini-pro', version: 'v1beta' },
      { model: 'gemini-pro', version: 'v1' },
    ];

    let lastError = null;
    
    for (const { model, version } of models) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
          }
        );

        if (res.ok) {
          const data = await res.json();
          const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";
          console.log(`Successfully used ${model} (${version})`);
          return responseText;
        }

        // If not 404, throw immediately (auth error, etc.)
        if (res.status !== 404) {
          const errorText = await res.text().catch(() => '');
          let errorData = { error: errorText };
          try {
            if (errorText) errorData = JSON.parse(errorText);
          } catch {
            errorData = { error: errorText };
          }
          console.error(`Gemini API error for ${model} (${version}):`, res.status, errorData);
          throw new Error(`Gemini API error: ${res.status} ${res.statusText}. ${errorText}`);
        }

        // 404 means model not found, try next
        console.log(`Model "${model}" with version "${version}" not found, trying next...`);
        lastError = `Model "${model}" with version "${version}" not found.`;
      } catch (error) {
        if (error.message.includes('404')) {
          lastError = error.message;
          continue; // Try next model
        }
        throw error; // Re-throw non-404 errors
      }
    }

    // If all models failed, throw last error
    throw new Error(`All Gemini models failed. ${lastError || 'Check your API key and available models.'}`);
  } catch (error) {
    console.error('Gemini API error:', error);
    throw error;
  }
}
