/**
 * External API services for enhanced functionality
 */
import axios from 'axios';

// Create separate axios instances for external APIs
const quotesApi = axios.create({
  baseURL: 'https://api.quotable.io',
  timeout: 5000,
});

const newsApi = axios.create({
  baseURL: 'https://api.thenewsapi.com/v1',
  timeout: 10000,
});

const weatherApi = axios.create({
  baseURL: 'https://api.openweathermap.org/data/2.5',
  timeout: 5000,
});

// Types
export interface Quote {
  _id: string;
  content: string;
  author: string;
  tags: string[];
  authorSlug: string;
  length: number;
}

export interface NewsArticle {
  uuid: string;
  title: string;
  description: string;
  keywords: string;
  snippet: string;
  url: string;
  image_url: string;
  language: string;
  published_at: string;
  source: string;
  categories: string[];
  relevance_score: number;
}

export interface WeatherData {
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
  };
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
  name: string;
  sys: {
    country: string;
  };
}

// Quotes API Service
export const quotesService = {
  // Get random inspirational quote
  async getRandomQuote(): Promise<Quote> {
    try {
      const response = await quotesApi.get('/random?tags=motivational|success|wisdom');
      return response.data;
    } catch (error) {
      console.error('Error fetching quote:', error);
      // Fallback quote
      return {
        _id: 'fallback',
        content: 'Success is not final, failure is not fatal: it is the courage to continue that counts.',
        author: 'Winston Churchill',
        tags: ['motivational'],
        authorSlug: 'winston-churchill',
        length: 85
      };
    }
  },

  // Get quotes by tag
  async getQuotesByTag(tag: string, limit: number = 5): Promise<Quote[]> {
    try {
      const response = await quotesApi.get(`/quotes?tags=${tag}&limit=${limit}`);
      return response.data.results;
    } catch (error) {
      console.error('Error fetching quotes by tag:', error);
      return [];
    }
  }
};

// News API Service (Career/Tech related)
export const newsService = {
  // Get career-related news
  async getCareerNews(limit: number = 10): Promise<NewsArticle[]> {
    try {
      // Using free tier - limited requests
      const response = await newsApi.get('/news/all', {
        params: {
          api_token: 'demo', // Replace with actual API key
          search: 'career technology jobs hiring',
          language: 'en',
          limit: limit,
          categories: 'business,tech'
        }
      });
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching career news:', error);
      // Return mock data for demo
      return [
        {
          uuid: 'mock-1',
          title: 'Tech Industry Hiring Trends for 2025',
          description: 'Latest insights into technology sector employment opportunities and skill demands.',
          keywords: 'technology, hiring, careers, 2025',
          snippet: 'The technology sector continues to show strong growth in hiring...',
          url: 'https://example.com/tech-hiring-2025',
          image_url: 'https://via.placeholder.com/300x200?text=Tech+News',
          language: 'en',
          published_at: new Date().toISOString(),
          source: 'Tech Career News',
          categories: ['business', 'tech'],
          relevance_score: 0.95
        },
        {
          uuid: 'mock-2',
          title: 'Remote Work Opportunities Surge in Software Development',
          description: 'Analysis of the growing remote work trend in software development roles.',
          keywords: 'remote work, software development, careers',
          snippet: 'Remote software development positions have increased by 40%...',
          url: 'https://example.com/remote-dev-jobs',
          image_url: 'https://via.placeholder.com/300x200?text=Remote+Work',
          language: 'en',
          published_at: new Date(Date.now() - 86400000).toISOString(),
          source: 'Career Insights',
          categories: ['business'],
          relevance_score: 0.88
        }
      ];
    }
  }
};

// Weather API Service (for location-based job insights)
export const weatherService = {
  // Get weather for job location context
  async getWeatherByCity(city: string): Promise<WeatherData | null> {
    try {
      const response = await weatherApi.get('/weather', {
        params: {
          q: city,
          appid: 'demo', // Replace with actual OpenWeather API key
          units: 'metric'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching weather:', error);
      return null;
    }
  }
};

// Utility function to get user's location for weather/job context
export const locationService = {
  async getUserLocation(): Promise<{ lat: number; lon: number } | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        () => {
          resolve(null);
        },
        { timeout: 5000 }
      );
    });
  }
};

// Icon service for better UI
export const iconService = {
  // Get weather icon URL
  getWeatherIconUrl(iconCode: string): string {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  },

  // Get placeholder image for news articles
  getPlaceholderImage(width: number = 300, height: number = 200, text: string = 'News'): string {
    return `https://via.placeholder.com/${width}x${height}?text=${encodeURIComponent(text)}`;
  }
};