import { api } from "../lib/api";
import { useAsyncData } from "../hooks/useAsyncData";

export function ServerStatusPage() {
  const { data, loading, error } = useAsyncData(api.getStatus, []);

  return (
    <>
      <h3>Server Status</h3>
      {loading ? <p className="notice">Loading status...</p> : null}
      {error ? <p className="red">{error}</p> : null}
      {data ? (
        <table className="horizontal-table modern-status-table" width="100%">
          <thead>
            <tr>
              <th>Group</th>
              <th>Server</th>
              <th>Login</th>
              <th>Char</th>
              <th>Map</th>
              <th>Online</th>
              <th>Peak</th>
            </tr>
          </thead>
          <tbody>
            {data.map((status) => (
              <tr key={`${status.groupName}-${status.serverName}`}>
                <td>{status.groupName}</td>
                <td>{status.serverName}</td>
                <td>{status.loginServerUp ? "Up" : "Down"}</td>
                <td>{status.charServerUp ? "Up" : "Down"}</td>
                <td>{status.mapServerUp ? "Up" : "Down"}</td>
                <td>{status.playersOnline}</td>
                <td>{status.playersPeak}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </>
  );
}
