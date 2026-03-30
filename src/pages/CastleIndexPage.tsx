import { Link } from "react-router-dom";
import { useAsyncData } from "../hooks/useAsyncData";
import { api } from "../lib/api";

export function CastleIndexPage() {
  const { data, loading, error } = useAsyncData(api.getCastles, []);

  return (
    <>
      <h2>Castles</h2>
      <p>This page shows what castles are activated and which guilds currently own them.</p>
      {loading ? <p className="notice">Loading castles...</p> : null}
      {error ? <p className="red">{error}</p> : null}
      {data ? (
        data.length > 0 ? (
          <table className="vertical-table">
            <thead>
              <tr>
                <th>Castle ID</th>
                <th>Castle</th>
                <th>Guild</th>
                <th>Economy</th>
              </tr>
            </thead>
            <tbody>
              {data.map((castle) => (
                <tr key={castle.castleId}>
                  <td>{castle.castleId}</td>
                  <td>{castle.castleName}</td>
                  <td>
                    {castle.guildId && castle.guildName ? (
                      <Link to={`/guild/view/${castle.guildId}`}>{castle.guildName}</Link>
                    ) : (
                      "None"
                    )}
                  </td>
                  <td>{castle.economy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No castles found.</p>
        )
      ) : null}
    </>
  );
}
