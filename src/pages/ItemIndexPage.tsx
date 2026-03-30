import { FormEvent, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAsyncData } from "../hooks/useAsyncData";
import { api } from "../lib/api";

const ITEM_TYPES = [
  { value: "", label: "Any" },
  { value: "weapon", label: "Weapon" },
  { value: "armor", label: "Armor" },
  { value: "healing", label: "Healing" },
  { value: "usable", label: "Usable" },
  { value: "etc", label: "Etc" },
  { value: "card", label: "Card" },
  { value: "ammo", label: "Ammo" },
  { value: "cash", label: "Cash Shop Reward" }
];

export function ItemIndexPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [form, setForm] = useState({
    itemId: searchParams.get("itemId") ?? "",
    name: searchParams.get("name") ?? "",
    type: searchParams.get("type") ?? ""
  });

  const itemIdValue =
    searchParams.get("itemId") && searchParams.get("itemId")?.trim()
      ? Number(searchParams.get("itemId"))
      : null;

  const itemsState = useAsyncData(
    () =>
      api.searchItems({
        itemId: itemIdValue && Number.isFinite(itemIdValue) ? itemIdValue : null,
        name: searchParams.get("name") ?? "",
        type: searchParams.get("type") ?? ""
      }),
    [searchParams.toString()]
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (form.itemId.trim()) params.set("itemId", form.itemId.trim());
    if (form.name.trim()) params.set("name", form.name.trim());
    if (form.type) params.set("type", form.type);
    setSearchParams(params);
  }

  return (
    <>
      <h2>Items</h2>
      <form className="search-form" onSubmit={handleSubmit}>
        <p>
          <label htmlFor="item_id">Item ID:</label>{" "}
          <input
            type="text"
            id="item_id"
            value={form.itemId}
            onChange={(event) => setForm((current) => ({ ...current, itemId: event.target.value }))}
          />{" "}
          <label htmlFor="name">Name:</label>{" "}
          <input
            type="text"
            id="name"
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          />{" "}
          <label htmlFor="type">Type:</label>{" "}
          <select
            id="type"
            value={form.type}
            onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))}
          >
            {ITEM_TYPES.map((type) => (
              <option key={type.label} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>{" "}
          <button type="submit">Search</button>{" "}
          <button
            type="button"
            onClick={() => {
              setForm({ itemId: "", name: "", type: "" });
              setSearchParams({});
            }}
          >
            Reset
          </button>
        </p>
      </form>

      {itemsState.loading ? <p className="notice">Loading items...</p> : null}
      {itemsState.error ? <p className="red">{itemsState.error}</p> : null}
      {itemsState.data ? (
        itemsState.data.length > 0 ? (
          <table className="horizontal-table" width="100%">
            <thead>
              <tr>
                <th>Item ID</th>
                <th>Name</th>
                <th>Type</th>
                <th>SubType</th>
                <th>NPC Buy</th>
                <th>NPC Sell</th>
                <th>Weight</th>
                <th>Attack</th>
                <th>Defense</th>
                <th>Range</th>
                <th>Slots</th>
                <th>Refineable</th>
                <th>Custom</th>
              </tr>
            </thead>
            <tbody>
              {itemsState.data.map((item) => (
                <tr key={item.itemId}>
                  <td><Link to={`/item/view/${item.itemId}`}>{item.itemId}</Link></td>
                  <td>{item.name}</td>
                  <td>{item.type || "Unknown"}</td>
                  <td>{item.subtype || "None"}</td>
                  <td>{item.priceBuy}</td>
                  <td>{item.priceSell}</td>
                  <td>{item.weight}</td>
                  <td>{item.attack}</td>
                  <td>{item.defense}</td>
                  <td>{item.range}</td>
                  <td>{item.slots}</td>
                  <td>{item.refineable ? "Yes" : "No"}</td>
                  <td>{item.custom ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No items found.</p>
        )
      ) : null}
    </>
  );
}
