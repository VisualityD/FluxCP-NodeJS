import { Link } from "react-router-dom";
import { useAsyncData } from "../hooks/useAsyncData";
import { api } from "../lib/api";

export function BuyingStoreIndexPage() {
  const { data, loading, error } = useAsyncData(api.getBuyingStoreList, []);

  return (
    <>
      <h2>Buyers</h2>
      {loading ? <p className="notice">Loading buyers...</p> : null}
      {error ? <p className="red">{error}</p> : null}
      {data ? (
        data.length > 0 ? (
          <table className="horizontal-table">
            <thead>
              <tr>
                <th>Buyer ID</th>
                <th>Buyer Name</th>
                <th>Title</th>
                <th>Map</th>
                <th>X</th>
                <th>Y</th>
                <th>Gender</th>
                <th>Autotrade</th>
              </tr>
            </thead>
            <tbody>
              {data.map((shop) => (
                <tr key={shop.id}>
                  <td>
                    <Link to={`/buyingstore/viewshop/${shop.id}`}>{shop.id}</Link>
                  </td>
                  <td>{shop.charName}</td>
                  <td>
                    <Link to={`/buyingstore/viewshop/${shop.id}`}>{shop.title || "Untitled Shop"}</Link>
                  </td>
                  <td>{shop.map}</td>
                  <td>{shop.x}</td>
                  <td>{shop.y}</td>
                  <td>{shop.sex}</td>
                  <td>{shop.autotrade ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No buyers found.</p>
        )
      ) : null}
    </>
  );
}
