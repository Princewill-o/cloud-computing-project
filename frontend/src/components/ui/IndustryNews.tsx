import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../shared/components/ui/Card";
import { Button } from "../../shared/components/ui/Button";
import { httpClient } from "../../services/httpClient";

interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  url: string;
  published_at: string;
  source: string;
  category: string;
  image_url: string;
}

interface NewsResponse {
  articles: NewsArticle[];
  total_available: number;
  last_updated: string;
  source: string;
}

export function IndustryNews() {
  const { data: newsData, isLoading } = useQuery({
    queryKey: ["industry-news"],
    queryFn: async (): Promise<NewsResponse> => {
      const response = await httpClient.get("/api/v1/external/industry-news?limit=3");
      return response.data;
    },
    refetchInterval: 15 * 60 * 1000, // Refresh every 15 minutes
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Industry News</CardTitle>
          <CardDescription>Latest tech and career updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex space-x-4">
                  <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!newsData || newsData.articles.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Industry News</CardTitle>
          <CardDescription>Latest tech and career updates</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-secondary">No news available at the moment.</p>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      career_trends: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      remote_work: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      skills: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      market_trends: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      cybersecurity: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <svg
            className="w-5 h-5 text-brand-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
            />
          </svg>
          Industry News
        </CardTitle>
        <CardDescription>Latest tech and career updates</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {newsData.articles.map((article) => (
            <div
              key={article.id}
              className="flex space-x-4 p-3 rounded-lg border border-border hover:bg-tertiary/50 transition-colors cursor-pointer"
              onClick={() => window.open(article.url, '_blank')}
            >
              <div className="flex-shrink-0">
                <img
                  src={article.image_url}
                  alt={article.title}
                  className="w-16 h-16 rounded-lg object-cover bg-gray-200 dark:bg-gray-700"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://via.placeholder.com/64x64?text=${encodeURIComponent(article.category)}`;
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-primary line-clamp-2 mb-1">
                  {article.title}
                </h4>
                <p className="text-xs text-secondary line-clamp-2 mb-2">
                  {article.summary}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(article.category)}`}>
                      {article.category.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-tertiary">
                      {article.source}
                    </span>
                  </div>
                  <span className="text-xs text-tertiary">
                    {formatDate(article.published_at)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs text-tertiary">
              Last updated: {formatDate(newsData.last_updated)}
            </span>
            <Button variant="ghost" size="sm">
              View More News →
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}