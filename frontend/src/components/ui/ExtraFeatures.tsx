import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../shared/components/ui/Card";
import { Button } from "../../shared/components/ui/Button";
import { httpClient } from "../../services/httpClient";

interface Advice {
  advice: {
    id: number;
    content: string;
    category: string;
  };
  timestamp: string;
  source: string;
}

interface Joke {
  joke: {
    id: number;
    type: string;
    setup: string;
    punchline: string;
  };
  timestamp: string;
  source: string;
}

interface FunFact {
  fact: {
    content: string;
    length: number;
    category: string;
  };
  timestamp: string;
  source: string;
}

export function CareerAdvice() {
  const { data: adviceData, isLoading, refetch } = useQuery({
    queryKey: ["career-advice"],
    queryFn: async (): Promise<Advice> => {
      const response = await httpClient.get("/api/v1/external/advice");
      return response.data;
    },
    refetchInterval: 10 * 60 * 1000, // Refresh every 10 minutes
  });

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-blue-200 dark:bg-blue-600 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-blue-200 dark:bg-blue-600 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!adviceData) return null;

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 hover:shadow-lg transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          Career Advice
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-800 dark:text-gray-200 mb-4">
          💡 {adviceData.advice.content}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600 dark:text-gray-400">
            Source: {adviceData.source.replace('_', ' ')}
          </span>
          <Button variant="ghost" size="sm" onClick={() => refetch()}>
            New Advice
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function ProgrammingJoke() {
  const { data: jokeData, isLoading, refetch } = useQuery({
    queryKey: ["programming-joke"],
    queryFn: async (): Promise<Joke> => {
      const response = await httpClient.get("/api/v1/external/joke");
      return response.data;
    },
    refetchInterval: 15 * 60 * 1000, // Refresh every 15 minutes
  });

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-purple-200 dark:bg-purple-600 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-purple-200 dark:bg-purple-600 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!jokeData) return null;

  return (
    <Card className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 hover:shadow-lg transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-800 dark:text-purple-200">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.01M15 10h1.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Programming Humor
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
            😄 {jokeData.joke.setup}
          </p>
          <p className="text-sm text-purple-700 dark:text-purple-300 font-semibold">
            {jokeData.joke.punchline}
          </p>
        </div>
        <div className="flex items-center justify-between mt-4">
          <span className="text-xs text-gray-600 dark:text-gray-400">
            Source: {jokeData.source.replace('_', ' ')}
          </span>
          <Button variant="ghost" size="sm" onClick={() => refetch()}>
            New Joke
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function FunFact() {
  const { data: factData, isLoading, refetch } = useQuery({
    queryKey: ["fun-fact"],
    queryFn: async (): Promise<FunFact> => {
      const response = await httpClient.get("/api/v1/external/fun-fact");
      return response.data;
    },
    refetchInterval: 20 * 60 * 1000, // Refresh every 20 minutes
  });

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-green-200 dark:bg-green-600 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-green-200 dark:bg-green-600 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!factData) return null;

  return (
    <Card className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 hover:shadow-lg transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Fun Fact
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-800 dark:text-gray-200 mb-4">
          🎯 {factData.fact.content}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600 dark:text-gray-400">
            Category: {factData.fact.category} • {factData.fact.length} chars
          </span>
          <Button variant="ghost" size="sm" onClick={() => refetch()}>
            New Fact
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}