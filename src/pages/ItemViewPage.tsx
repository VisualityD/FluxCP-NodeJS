import { Link, Navigate, useParams } from "react-router-dom";
import { useAsyncData } from "../hooks/useAsyncData";
import { api } from "../lib/api";

function renderScript(value: string | null) {
  return value ? <pre>{value}</pre> : "None";
}

export function ItemViewPage() {
  const params = useParams();
  const itemId = Number(params.id);
  const itemState = useAsyncData(() => api.getItem(itemId), [itemId]);

  if (!Number.isFinite(itemId)) {
    return <Navigate to="/item/index" replace />;
  }

  return (
    <>
      <h2>Viewing Item</h2>
      {itemState.loading ? <p className="notice">Loading item...</p> : null}
      {itemState.error ? <p className="red">{itemState.error}</p> : null}
      {itemState.data ? (
        <>
          <h3>
            #{itemState.data.itemId}: {itemState.data.name}
          </h3>
          <table className="vertical-table">
            <tbody>
              <tr>
                <th>Item ID</th>
                <td>{itemState.data.itemId}</td>
                <th>Identifier</th>
                <td>{itemState.data.identifier}</td>
              </tr>
              <tr>
                <th>Name</th>
                <td>{itemState.data.name}</td>
                <th>Type</th>
                <td>
                  {itemState.data.type || "Unknown"}
                  {itemState.data.subtype ? ` - ${itemState.data.subtype}` : ""}
                </td>
              </tr>
              <tr>
                <th>NPC Buy</th>
                <td>{itemState.data.priceBuy}</td>
                <th>NPC Sell</th>
                <td>{itemState.data.priceSell}</td>
              </tr>
              <tr>
                <th>Weight</th>
                <td>{itemState.data.weight}</td>
                <th>Weapon Level</th>
                <td>{itemState.data.weaponLevel}</td>
              </tr>
              <tr>
                <th>Attack</th>
                <td>{itemState.data.attack}</td>
                <th>Defense</th>
                <td>{itemState.data.defense}</td>
              </tr>
              <tr>
                <th>Range</th>
                <td>{itemState.data.range}</td>
                <th>Slots</th>
                <td>{itemState.data.slots}</td>
              </tr>
              <tr>
                <th>MATK</th>
                <td>{itemState.data.magicAttack}</td>
                <th>Gender</th>
                <td>{itemState.data.gender || "Both"}</td>
              </tr>
              <tr>
                <th>Min Equip Level</th>
                <td>{itemState.data.equipLevelMin || "None"}</td>
                <th>Max Equip Level</th>
                <td>{itemState.data.equipLevelMax || "None"}</td>
              </tr>
              <tr>
                <th>Refineable</th>
                <td>{itemState.data.refineable ? "Yes" : "No"}</td>
                <th>Custom</th>
                <td>{itemState.data.custom ? "Yes" : "No"}</td>
              </tr>
              <tr>
                <th>Equip Locations</th>
                <td colSpan={3}>{itemState.data.equipLocations.length > 0 ? itemState.data.equipLocations.join(" / ") : "None"}</td>
              </tr>
              <tr>
                <th>Equip Upper</th>
                <td colSpan={3}>{itemState.data.equipUpper.length > 0 ? itemState.data.equipUpper.join(" / ") : "None"}</td>
              </tr>
              <tr>
                <th>Equippable Jobs</th>
                <td colSpan={3}>{itemState.data.equipJobs.length > 0 ? itemState.data.equipJobs.join(" / ") : "None"}</td>
              </tr>
              <tr>
                <th>Trade Restrictions</th>
                <td colSpan={3}>{itemState.data.tradeRestrictions.length > 0 ? itemState.data.tradeRestrictions.join(" / ") : "None"}</td>
              </tr>
              <tr>
                <th>Use Script</th>
                <td colSpan={3}>{renderScript(itemState.data.script)}</td>
              </tr>
              <tr>
                <th>Equip Script</th>
                <td colSpan={3}>{renderScript(itemState.data.equipScript)}</td>
              </tr>
              <tr>
                <th>Unequip Script</th>
                <td colSpan={3}>{renderScript(itemState.data.unequipScript)}</td>
              </tr>
            </tbody>
          </table>

          <h3>Dropped By</h3>
          {itemState.data.drops.length > 0 ? (
            <table className="vertical-table">
              <thead>
                <tr>
                  <th>Monster ID</th>
                  <th>Monster Name</th>
                  <th>Drop Chance</th>
                  <th>Steal</th>
                  <th>Monster Level</th>
                  <th>Race</th>
                  <th>Element</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {itemState.data.drops.map((drop) => (
                  <tr key={`${drop.monsterId}-${drop.dropRate}-${drop.isMvp ? "mvp" : "normal"}`}>
                    <td><Link to={`/monster/view/${drop.monsterId}`}>{drop.monsterId}</Link></td>
                    <td>{drop.monsterName}</td>
                    <td>{drop.dropRate}%</td>
                    <td>{drop.canSteal ? "Yes" : "No"}</td>
                    <td>{drop.monsterLevel}</td>
                    <td>{drop.monsterRace}</td>
                    <td>{drop.monsterElement}</td>
                    <td>{drop.isMvp ? "MVP" : "Normal"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No known drops found for this item.</p>
          )}

          <p><Link to="/item/index">Back to item list</Link></p>
        </>
      ) : null}
    </>
  );
}
