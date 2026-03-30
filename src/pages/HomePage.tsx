import { api } from "../lib/api";
import { useAsyncData } from "../hooks/useAsyncData";
import { NewsList } from "../components/NewsList";

export function HomePage() {
  const { data, loading, error } = useAsyncData(api.getNews, []);

  return (
    <>
      <h3>Welcome to the modernized FluxCP shell</h3>
      <p>
        This React entry point intentionally preserves the original FluxCP layout and visual language
        while the backend is being migrated from PHP modules to Node.js services.
      </p>
      {loading ? <p className="notice">Loading news...</p> : null}
      {error ? <p className="red">{error}</p> : null}
      {data ? <NewsList items={data.slice(0, 3)} /> : null}
    </>
  );
}
