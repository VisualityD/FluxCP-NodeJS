import type { NewsItem } from "../types";

type Props = {
  items: NewsItem[];
};

export function NewsList({ items }: Props) {
  if (items.length === 0) {
    return <p>No news yet.</p>;
  }

  return (
    <div className="newsDiv">
      {items.map((item) => (
        <article key={item.id}>
          <h4>{item.title}</h4>
          <div className="newsCont">
            <span className="newsDate">
              <small>
                by {item.author} on {new Date(item.createdAt).toLocaleDateString("en-CA")}
              </small>
            </span>
            <p>{item.body}</p>
            {item.link ? (
              <a className="news_link" href={item.link} target="_blank" rel="noreferrer">
                <small>Read more</small>
              </a>
            ) : null}
            <div className="clear" />
          </div>
        </article>
      ))}
    </div>
  );
}
