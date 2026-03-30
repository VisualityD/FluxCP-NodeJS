import { Link } from "react-router-dom";
import { useAsyncData } from "../hooks/useAsyncData";
import { api } from "../lib/api";

export function GuildRankingPage() {
  const rankingState = useAsyncData(api.getGuildRanking, []);

  return (
    <>
      <h2>Guild Ranking</h2>
      <h3>Top Guilds</h3>
      {rankingState.loading ? <p className="notice">Loading ranking...</p> : null}
      {rankingState.error ? <p className="red">{rankingState.error}</p> : null}
      {rankingState.data ? (
        rankingState.data.length > 0 ? (
          <table className="horizontal-table" width="100%">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Guild Name</th>
                <th>Guild Level</th>
                <th>Castles Owned</th>
                <th>Members</th>
                <th>Average Level</th>
                <th>Experience</th>
              </tr>
            </thead>
            <tbody>
                {rankingState.data.map((entry) => (
                  <tr key={entry.guildId}>
                    <td>{entry.rank}</td>
                    <td><Link to={`/guild/view/${entry.guildId}`}>{entry.name}</Link></td>
                    <td>{entry.guildLevel}</td>
                    <td>{entry.castles}</td>
                  <td>{entry.members}</td>
                  <td>{entry.averageLevel}</td>
                  <td>{entry.experience}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No guilds found.</p>
        )
      ) : null}
    </>
  );
}
