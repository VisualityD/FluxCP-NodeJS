import { NewsList } from "../components/NewsList";
import { useAsyncData } from "../hooks/useAsyncData";
import { api } from "../lib/api";

export function NewsPage() {
  const { data, loading, error } = useAsyncData(api.getNews, []);

  return (
    <>
      <h3>News</h3>
      {loading ? <p className="notice">Loading news...</p> : null}
      {error ? <p className="red">{error}</p> : null}
      {data ? <NewsList items={data} /> : null}
    </>
  );
}
