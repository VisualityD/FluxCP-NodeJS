import { Link, Navigate, useParams } from "react-router-dom";
import { useAsyncData } from "../hooks/useAsyncData";
import { api } from "../lib/api";

function genderText(value: string): string {
  if (value === "M") return "Male";
  if (value === "F") return "Female";
  return "Unknown";
}

function renderInventoryFlags(
  broken: boolean,
  bound: boolean,
  favorite: boolean,
  enchantGrade: number,
  expireTime: string | null
) {
  return [
    broken ? "Broken" : null,
    bound ? "Bound" : null,
    favorite ? "Favorite" : null,
    enchantGrade > 0 ? `Enchant ${enchantGrade}` : null,
    expireTime ? `Expires ${expireTime}` : null
  ].filter(Boolean).join(" / ") || "None";
}

export function CharacterViewPage() {
  const params = useParams();
  const characterId = Number(params.id);
  const sessionState = useAsyncData(api.getSession, []);
  const profileState = useAsyncData(() => api.getCharacter(characterId), [characterId]);

  if (!Number.isFinite(characterId)) {
    return <Navigate to="/account/view" replace />;
  }

  if (!sessionState.loading && !sessionState.data?.user) {
    return <Navigate to="/account/login" replace />;
  }

  return (
    <>
      <h2>Viewing Character</h2>
      {sessionState.loading || profileState.loading ? <p className="notice">Loading character...</p> : null}
      {profileState.error ? <p className="red">{profileState.error}</p> : null}
      {profileState.data ? (
        <>
          <h3>Character Information for {profileState.data.name}</h3>
          <table className="vertical-table">
            <tbody>
              <tr>
                <th>Character ID</th>
                <td>{profileState.data.charId}</td>
                <th>Account</th>
                <td>{profileState.data.accountName}</td>
                <th>Slot</th>
                <td>{profileState.data.slot}</td>
              </tr>
              <tr>
                <th>Job Class</th>
                <td>{profileState.data.jobName}</td>
                <th>Gender</th>
                <td>{genderText(profileState.data.sex)}</td>
                <th>Status</th>
                <td>{profileState.data.online ? "Online" : "Offline"}</td>
              </tr>
              <tr>
                <th>Base Level</th>
                <td>{profileState.data.baseLevel}</td>
                <th>Base EXP</th>
                <td>{profileState.data.baseExp}</td>
                <th>Zeny</th>
                <td>{profileState.data.zeny}</td>
              </tr>
              <tr>
                <th>Job Level</th>
                <td>{profileState.data.jobLevel}</td>
                <th>Job EXP</th>
                <td>{profileState.data.jobExp}</td>
                <th>Deaths</th>
                <td>{profileState.data.deathCount}</td>
              </tr>
              <tr>
                <th>HP</th>
                <td>{profileState.data.hp} / {profileState.data.maxHp}</td>
                <th>SP</th>
                <td>{profileState.data.sp} / {profileState.data.maxSp}</td>
                <th>Points</th>
                <td>{profileState.data.statusPoints} status / {profileState.data.skillPoints} skill</td>
              </tr>
              <tr>
                <th>Guild</th>
                <td>{profileState.data.guild.name || "None"}</td>
                <th>Guild Position</th>
                <td>{profileState.data.guild.position || "None"}</td>
                <th>Guild Tax</th>
                <td>{profileState.data.guild.tax}%</td>
              </tr>
              <tr>
                <th>Party</th>
                <td>{profileState.data.party.name || "None"}</td>
                <th>Party Leader</th>
                <td>{profileState.data.party.leaderName || "None"}</td>
                <th>Pet</th>
                <td>
                  {profileState.data.pet.name
                    ? `${profileState.data.pet.name} (${profileState.data.pet.monsterName || "Unknown"})`
                    : "None"}
                </td>
              </tr>
              <tr>
                <th>Partner</th>
                <td>{profileState.data.family.partnerName || "None"}</td>
                <th>Child</th>
                <td>{profileState.data.family.childName || "None"}</td>
                <th>Homunculus</th>
                <td>
                  {profileState.data.homunculus.name
                    ? `${profileState.data.homunculus.name} (${profileState.data.homunculus.className || "Unknown"})`
                    : "None"}
                </td>
              </tr>
              <tr>
                <th>Mother</th>
                <td>{profileState.data.family.motherName || "None"}</td>
                <th>Father</th>
                <td colSpan={3}>{profileState.data.family.fatherName || "None"}</td>
              </tr>
              <tr>
                <th>Stats</th>
                <td colSpan={5}>
                  STR {profileState.data.stats.str} | AGI {profileState.data.stats.agi} | VIT {profileState.data.stats.vit} | INT {profileState.data.stats.int} | DEX {profileState.data.stats.dex} | LUK {profileState.data.stats.luk}
                </td>
              </tr>
            </tbody>
          </table>

          <h3>Other Party Members</h3>
          {profileState.data.party.members.length > 0 ? (
            <table className="vertical-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Class</th>
                  <th>Base Lv</th>
                  <th>Job Lv</th>
                  <th>Guild</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {profileState.data.party.members.map((member) => (
                  <tr key={member.charId}>
                    <td><Link to={`/character/view/${member.charId}`}>{member.name}</Link></td>
                    <td>{member.jobName}</td>
                    <td>{member.baseLevel}</td>
                    <td>{member.jobLevel}</td>
                    <td>{member.guildName || "None"}</td>
                    <td>{member.online ? "Online" : "Offline"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>There are no other members in this party.</p>
          )}

          <h3>Friends</h3>
          {profileState.data.friends.length > 0 ? (
            <table className="vertical-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Class</th>
                  <th>Base Lv</th>
                  <th>Job Lv</th>
                  <th>Guild</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {profileState.data.friends.map((friend) => (
                  <tr key={friend.charId}>
                    <td><Link to={`/character/view/${friend.charId}`}>{friend.name}</Link></td>
                    <td>{friend.jobName}</td>
                    <td>{friend.baseLevel}</td>
                    <td>{friend.jobLevel}</td>
                    <td>{friend.guildName || "None"}</td>
                    <td>{friend.online ? "Online" : "Offline"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>{profileState.data.name} has no friends.</p>
          )}

          <h3>Inventory Items</h3>
          {profileState.data.inventory.length > 0 ? (
            <table className="vertical-table">
              <thead>
                <tr>
                  <th>Item ID</th>
                  <th>Name</th>
                  <th>Amount</th>
                  <th>Identified</th>
                  <th>Refine</th>
                  <th>Equipped</th>
                  <th>Cards</th>
                  <th>Flags</th>
                </tr>
              </thead>
              <tbody>
                {profileState.data.inventory.map((item, index) => (
                  <tr key={`${item.itemId}-${index}`}>
                    <td>{item.itemId ? <Link to={`/item/view/${item.itemId}`}>{item.itemId}</Link> : "Unknown"}</td>
                    <td>{item.name}</td>
                    <td>{item.amount}</td>
                    <td>{item.identify ? "Yes" : "No"}</td>
                    <td>{item.refine > 0 ? `+${item.refine}` : "0"}</td>
                    <td>{item.equip > 0 ? "Yes" : "No"}</td>
                    <td>{item.cards.length > 0 ? item.cards.join(", ") : "None"}</td>
                    <td>{renderInventoryFlags(item.broken, item.bound, item.favorite, item.enchantGrade, item.expireTime)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No inventory items found.</p>
          )}

          <p><Link to="/account/view">Back to my account</Link></p>
        </>
      ) : null}
    </>
  );
}
