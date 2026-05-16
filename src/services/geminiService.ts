import { Book } from '../types';

export const geminiService = {
  async getRecommendations(books: Book[], userHistory: string[]): Promise<string[]> {
    try {
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ books, userHistory }),
      });
      const data = await response.json();
      return data.recommendations || [];
    } catch (e) {
      console.error('Gemini Recommendation Error:', e);
      return [];
    }
  }
};
