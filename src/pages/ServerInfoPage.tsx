import { api } from "../lib/api";
import { useAsyncData } from "../hooks/useAsyncData";

export function ServerInfoPage() {
  const { data, loading, error } = useAsyncData(api.getServerInfo, []);

  return (
    <>
      <h2>Server Information</h2>
      <p>General database statistics and job class distribution for the current rAthena server.</p>
      {loading ? <p className="notice">Loading server information...</p> : null}
      {error ? <p className="red">{error}</p> : null}
      {data ? (
        <>
          <h3>{data.serverName}</h3>
          <table className="vertical-table">
            <tbody>
              <tr>
                <th>Accounts</th>
                <td>{data.accounts}</td>
              </tr>
              <tr>
                <th>Characters</th>
                <td>{data.characters}</td>
              </tr>
              <tr>
                <th>Guilds</th>
                <td>{data.guilds}</td>
              </tr>
              <tr>
                <th>Parties</th>
                <td>{data.parties}</td>
              </tr>
              <tr>
                <th>Total Zeny</th>
                <td>{data.zeny}</td>
              </tr>
            </tbody>
          </table>

          <h3>Job Class Distribution</h3>
          {data.classDistribution.length > 0 ? (
            <table className="vertical-table">
              <thead>
                <tr>
                  <th>Class</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {data.classDistribution.map((entry) => (
                  <tr key={entry.jobClass}>
                    <td>{entry.jobName}</td>
                    <td>{entry.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No class statistics found.</p>
          )}
        </>
      ) : null}
    </>
  );
}
