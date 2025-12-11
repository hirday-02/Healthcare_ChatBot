const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api';

interface RequestOptions extends RequestInit {
  query?: Record<string, string | undefined>;
}

const buildUrl = (path: string, query?: RequestOptions['query']): string => {
  // Remove leading slash from path to ensure it's relative to base URL
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  // Ensure base URL ends with a slash for proper URL joining
  const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL : `${API_BASE_URL}/`;
  const url = new URL(cleanPath, baseUrl);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        url.searchParams.append(key, value);
      }
    });
  }

  return url.toString();
};

export const apiRequest = async <T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> => {
  const { query, headers, ...rest } = options;
  
  try {
    const response = await fetch(buildUrl(path, query), {
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      ...rest
    });

    // Handle 204 No Content (successful PUT/DELETE without body)
    if (response.status === 204) {
      return undefined as unknown as T;
    }

    // Handle error responses
    if (!response.ok) {
      let errorMessage = 'Request failed';
      try {
        const errorBody = await response.json();
        errorMessage = errorBody.error ?? `HTTP ${response.status}: ${response.statusText}`;
      } catch {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    // Handle successful responses with JSON body
    return (await response.json()) as T;
  } catch (error) {
    // Re-throw if it's already an Error we created
    if (error instanceof Error) {
      throw error;
    }
    // Handle network errors or other fetch failures
    throw new Error(`Network error: ${error instanceof Error ? error.message : 'Failed to connect to server'}`);
  }
};

