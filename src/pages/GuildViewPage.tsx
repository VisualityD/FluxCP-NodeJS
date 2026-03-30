import { Link, Navigate, useParams } from "react-router-dom";
import { useAsyncData } from "../hooks/useAsyncData";
import { api } from "../lib/api";

function renderStorageFlags(bound: boolean, enchantGrade: number, expireTime: string | null) {
  return [
    bound ? "Bound" : null,
    enchantGrade > 0 ? `Enchant ${enchantGrade}` : null,
    expireTime ? `Expires ${expireTime}` : null
  ].filter(Boolean).join(" / ") || "None";
}

export function GuildViewPage() {
  const params = useParams();
  const guildId = Number(params.id);
  const guildState = useAsyncData(() => api.getGuild(guildId), [guildId]);

  if (!Number.isFinite(guildId)) {
    return <Navigate to="/ranking/guild" replace />;
  }

  return (
    <>
      <h2>Viewing Guild</h2>
      {guildState.loading ? <p className="notice">Loading guild...</p> : null}
      {guildState.error ? <p className="red">{guildState.error}</p> : null}
      {guildState.data ? (
        <>
          <h3>Guild Information for "{guildState.data.name}"</h3>
          <table className="vertical-table">
            <tbody>
              <tr>
                <th>Guild ID</th>
                <td>{guildState.data.guildId}</td>
                <th>Leader</th>
                <td>
                  {guildState.data.leaderName ? (
                    <Link to={`/character/view/${guildState.data.leaderCharId}`}>{guildState.data.leaderName}</Link>
                  ) : (
                    "Unknown"
                  )}
                </td>
                <th>Guild Level</th>
                <td>{guildState.data.guildLevel}</td>
              </tr>
              <tr>
                <th>Online Members</th>
                <td>{guildState.data.onlineMembers}</td>
                <th>Capacity</th>
                <td>{guildState.data.maxMembers}</td>
                <th>Average Level</th>
                <td>{guildState.data.averageLevel}</td>
              </tr>
              <tr>
                <th>Guild EXP</th>
                <td>{guildState.data.experience}</td>
                <th>EXP until Level Up</th>
                <td>{guildState.data.nextExperience}</td>
                <th>Skill Points</th>
                <td>{guildState.data.skillPoints}</td>
              </tr>
              <tr>
                <th>Guild Notice 1</th>
                <td colSpan={5}>{guildState.data.message1 || "None"}</td>
              </tr>
              <tr>
                <th>Guild Notice 2</th>
                <td colSpan={5}>{guildState.data.message2 || "None"}</td>
              </tr>
            </tbody>
          </table>

          <h3>Castles</h3>
          {guildState.data.castles.length > 0 ? (
            <table className="vertical-table">
              <thead>
                <tr>
                  <th>Castle ID</th>
                  <th>Castle Name</th>
                </tr>
              </thead>
              <tbody>
                {guildState.data.castles.map((castle) => (
                  <tr key={castle.castleId}>
                    <td>{castle.castleId}</td>
                    <td>{castle.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>This guild owns no castles.</p>
          )}

          <h3>Alliances</h3>
          {guildState.data.alliances.length > 0 ? (
            <table className="vertical-table">
              <thead>
                <tr>
                  <th>Guild ID</th>
                  <th>Guild Name</th>
                </tr>
              </thead>
              <tbody>
                {guildState.data.alliances.map((alliance) => (
                  <tr key={`alliance-${alliance.guildId}`}>
                    <td><Link to={`/guild/view/${alliance.guildId}`}>{alliance.guildId}</Link></td>
                    <td>{alliance.name || "Unknown"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>There are no alliances for this guild.</p>
          )}

          <h3>Oppositions</h3>
          {guildState.data.oppositions.length > 0 ? (
            <table className="vertical-table">
              <thead>
                <tr>
                  <th>Guild ID</th>
                  <th>Guild Name</th>
                </tr>
              </thead>
              <tbody>
                {guildState.data.oppositions.map((opposition) => (
                  <tr key={`opposition-${opposition.guildId}`}>
                    <td><Link to={`/guild/view/${opposition.guildId}`}>{opposition.guildId}</Link></td>
                    <td>{opposition.name || "Unknown"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>There are no oppositions for this guild.</p>
          )}

          <h3>Guild Members</h3>
          {guildState.data.members.length > 0 ? (
            <table className="vertical-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Job Class</th>
                  <th>Base Level</th>
                  <th>Job Level</th>
                  <th>EXP Devotion</th>
                  <th>Position ID</th>
                  <th>Position Name</th>
                  <th>Guild Rights</th>
                  <th>Tax</th>
                  <th>Last Login</th>
                </tr>
              </thead>
              <tbody>
                {guildState.data.members.map((member) => (
                  <tr key={member.charId}>
                    <td><Link to={`/character/view/${member.charId}`}>{member.name}</Link></td>
                    <td>{member.jobName}</td>
                    <td>{member.baseLevel}</td>
                    <td>{member.jobLevel}</td>
                    <td>{member.devotion}</td>
                    <td>{member.position}</td>
                    <td>{member.positionName || "None"}</td>
                    <td>{member.rights}</td>
                    <td>{member.tax}%</td>
                    <td>{member.lastLogin}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>There are no members in this guild.</p>
          )}

          <h3>Guild Storage</h3>
          {guildState.data.storage.length > 0 ? (
            <table className="vertical-table">
              <thead>
                <tr>
                  <th>Item ID</th>
                  <th>Name</th>
                  <th>Amount</th>
                  <th>Identified</th>
                  <th>Refine</th>
                  <th>Cards</th>
                  <th>Flags</th>
                </tr>
              </thead>
              <tbody>
                {guildState.data.storage.map((item, index) => (
                  <tr key={`${item.itemId}-${index}`}>
                    <td>{item.itemId ? <Link to={`/item/view/${item.itemId}`}>{item.itemId}</Link> : "Unknown"}</td>
                    <td>{item.name}</td>
                    <td>{item.amount}</td>
                    <td>{item.identify ? "Yes" : "No"}</td>
                    <td>{item.refine > 0 ? `+${item.refine}` : "0"}</td>
                    <td>{item.cards.length > 0 ? item.cards.join(", ") : "None"}</td>
                    <td>{renderStorageFlags(item.bound, item.enchantGrade, item.expireTime)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>There are no guild storage items for this guild.</p>
          )}

          <p><Link to="/ranking/guild">Back to guild ranking</Link></p>
        </>
      ) : null}
    </>
  );
}
