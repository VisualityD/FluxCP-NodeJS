import { Link, Navigate, useParams } from "react-router-dom";
import { useAsyncData } from "../hooks/useAsyncData";
import { api } from "../lib/api";

export function BuyingStorePage() {
  const params = useParams();
  const shopId = Number(params.id);
  const shopState = useAsyncData(() => api.getBuyingStoreShop(shopId), [shopId]);

  if (!Number.isFinite(shopId)) {
    return <Navigate to="/buyingstore/index" replace />;
  }

  return (
    <>
      {shopState.loading ? <p className="notice">Loading buyer shop...</p> : null}
      {shopState.error ? <p className="red">{shopState.error}</p> : null}
      {shopState.data ? (
        <>
          <h2>Buyer Items Of [{shopState.data.charName}]</h2>
          <h3 className="market-shop-title">{shopState.data.title || "Untitled Shop"}</h3>
          <p className="market-shop-meta">
            {shopState.data.map}, {shopState.data.x}, {shopState.data.y}
          </p>

          {shopState.data.items.length > 0 ? (
            <table className="horizontal-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {shopState.data.items.map((item) => (
                  <tr key={`${item.itemId}-${item.price}-${item.amount}`}>
                    <td>
                      <Link to={`/item/view/${item.itemId}`}>{item.itemId}</Link>
                    </td>
                    <td>{item.itemName}</td>
                    <td className="market-price">{item.price.toLocaleString()} z</td>
                    <td>{item.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No requested items found in this buying store.</p>
          )}

          <p>
            <Link to="/buyingstore/index">Back to buyers</Link>
          </p>
        </>
      ) : null}
    </>
  );
}
