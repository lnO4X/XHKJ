export const useStrapi = () => {
  const config = useRuntimeConfig();
  const baseURL = config.public.strapiUrl + '/api';

  async function find<T = any>(endpoint: string, params?: Record<string, any>): Promise<T> {
    return $fetch<T>(`${baseURL}/${endpoint}`, { params });
  }

  async function findOne<T = any>(endpoint: string, id: string | number, params?: Record<string, any>): Promise<T> {
    return $fetch<T>(`${baseURL}/${endpoint}/${id}`, { params });
  }

  async function create<T = any>(endpoint: string, data: Record<string, any>): Promise<T> {
    return $fetch<T>(`${baseURL}/${endpoint}`, { method: 'POST', body: { data } });
  }

  async function getSingle<T = any>(endpoint: string, params?: Record<string, any>): Promise<T> {
    return $fetch<T>(`${baseURL}/${endpoint}`, { params });
  }

  function getStrapiMedia(url: string | null): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${config.public.strapiUrl}${url}`;
  }

  return { find, findOne, create, getSingle, getStrapiMedia };
};
