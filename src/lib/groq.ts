export interface MoodAnalysis {
  summary: string
  mood: 'happy' | 'sad' | 'peaceful' | 'anxious' | 'excited' | 'thoughtful' | 'neutral'
}

export async function analyzeMood(content: string): Promise<MoodAnalysis> {
  try {
    const response = await fetch('/api/analyze-mood', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data as MoodAnalysis;
  } catch (error) {
    console.error('Error getting AI response:', error);

    // Return a fallback response
    return {
      summary: 'I\'m here to listen whenever you\'re ready to share more. Take care of yourself! 💙',
      mood: 'neutral'
    };
  }
}