import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "../../shared/components/ui/Card";
import { httpClient } from "../../services/httpClient";

interface Quote {
  content: string;
  author: string;
  category: string;
}

interface QuoteResponse {
  quote: Quote;
  timestamp: string;
  source: string;
}

export function MotivationalQuote() {
  const { data: quoteData, isLoading } = useQuery({
    queryKey: ["motivational-quote"],
    queryFn: async (): Promise<QuoteResponse> => {
      const response = await httpClient.get("/api/v1/external/motivational-quote");
      return response.data;
    },
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-r from-brand-50 to-brand-100 dark:from-gray-800 dark:to-gray-700 border-brand-200 dark:border-gray-600">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-brand-200 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-brand-200 dark:bg-gray-600 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!quoteData) {
    return null;
  }

  const { quote } = quoteData;

  return (
    <Card className="bg-gradient-to-r from-brand-50 to-brand-100 dark:from-gray-800 dark:to-gray-700 border-brand-200 dark:border-gray-600 hover:shadow-lg transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-brand-500 rounded-full flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <blockquote className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2 italic">
              "{quote.content}"
            </blockquote>
            <cite className="text-xs text-gray-600 dark:text-gray-400 font-semibold">
              — {quote.author}
            </cite>
            <div className="mt-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-brand-100 dark:bg-brand-900 text-brand-800 dark:text-brand-200">
                {quote.category}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}