import { Link, Navigate, useParams } from "react-router-dom";
import { useAsyncData } from "../hooks/useAsyncData";
import { api } from "../lib/api";

export function VendingShopPage() {
  const params = useParams();
  const shopId = Number(params.id);
  const shopState = useAsyncData(() => api.getVendingShop(shopId), [shopId]);

  if (!Number.isFinite(shopId)) {
    return <Navigate to="/vending/index" replace />;
  }

  return (
    <>
      {shopState.loading ? <p className="notice">Loading shop...</p> : null}
      {shopState.error ? <p className="red">{shopState.error}</p> : null}
      {shopState.data ? (
        <>
          <h2>Vending Items Of [{shopState.data.charName}]</h2>
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
                  <th>Refine</th>
                  <th>Slots</th>
                  <th>Cards</th>
                  <th>Options</th>
                  <th>Price</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {shopState.data.items.map((item) => (
                  <tr key={item.cartInventoryId}>
                    <td>
                      <Link to={`/item/view/${item.itemId}`}>{item.itemId}</Link>
                    </td>
                    <td>{item.itemName}</td>
                    <td>{item.refine > 0 ? `+${item.refine}` : "0"}</td>
                    <td>{item.slots > 0 ? item.slots : "0"}</td>
                    <td>{item.cards.length > 0 ? item.cards.join(", ") : "None"}</td>
                    <td>{item.options.length > 0 ? item.options.join(", ") : "None"}</td>
                    <td className="market-price">{item.price.toLocaleString()} z</td>
                    <td>{item.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No items found in this vending shop.</p>
          )}

          <p>
            <Link to="/vending/index">Back to vendors</Link>
          </p>
        </>
      ) : null}
    </>
  );
}
