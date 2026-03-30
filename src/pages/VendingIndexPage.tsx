import { Link } from "react-router-dom";
import { useAsyncData } from "../hooks/useAsyncData";
import { api } from "../lib/api";

export function VendingIndexPage() {
  const { data, loading, error } = useAsyncData(api.getVendingList, []);

  return (
    <>
      <h2>Vendors</h2>
      {loading ? <p className="notice">Loading vendors...</p> : null}
      {error ? <p className="red">{error}</p> : null}
      {data ? (
        data.length > 0 ? (
          <table className="horizontal-table">
            <thead>
              <tr>
                <th>Vendor ID</th>
                <th>Vendor Name</th>
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
                    <Link to={`/vending/viewshop/${shop.id}`}>{shop.id}</Link>
                  </td>
                  <td>{shop.charName}</td>
                  <td>
                    <Link to={`/vending/viewshop/${shop.id}`}>{shop.title || "Untitled Shop"}</Link>
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
          <p>No vendors found.</p>
        )
      ) : null}
    </>
  );
}
