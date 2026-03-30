import { Link, Navigate } from "react-router-dom";
import { useAsyncData } from "../hooks/useAsyncData";
import { api } from "../lib/api";

function formatDate(value: string | null): string {
  if (!value || value.startsWith("1000-01-01")) {
    return "Never";
  }

  return new Date(value).toLocaleString();
}

function genderText(value: string): string {
  if (value === "M") {
    return "Male";
  }
  if (value === "F") {
    return "Female";
  }
  return "Unknown";
}

export function AccountViewPage() {
  const sessionState = useAsyncData(api.getSession, []);
  const accountState = useAsyncData(api.getMyAccount, []);

  if (!sessionState.loading && !sessionState.data?.user) {
    return <Navigate to="/account/login" replace />;
  }

  return (
    <>
      <h2>My Account</h2>
      {sessionState.loading || accountState.loading ? <p className="notice">Loading account...</p> : null}
      {accountState.error ? <p className="red">{accountState.error}</p> : null}
      {accountState.data ? (
        <>
          <table className="vertical-table">
            <tbody>
              <tr>
                <th>Username</th>
                <td>{accountState.data.username}</td>
                <th>Account ID</th>
                <td>{accountState.data.accountId}</td>
              </tr>
              <tr>
                <th>Email</th>
                <td>{accountState.data.email || "None"}</td>
                <th>Group</th>
                <td>
                  {accountState.data.groupName} ({accountState.data.groupId})
                </td>
              </tr>
              <tr>
                <th>Gender</th>
                <td>{genderText(accountState.data.sex)}</td>
                <th>Credits</th>
                <td>{accountState.data.credits}</td>
              </tr>
              <tr>
                <th>Login Count</th>
                <td>{accountState.data.loginCount}</td>
                <th>State</th>
                <td>{accountState.data.state}</td>
              </tr>
              <tr>
                <th>Birthdate</th>
                <td>{accountState.data.birthdate || "None"}</td>
                <th>Last Login</th>
                <td>{formatDate(accountState.data.lastLogin)}</td>
              </tr>
              <tr>
                <th>Last IP</th>
                <td colSpan={3}>{accountState.data.lastIp || "None"}</td>
              </tr>
            </tbody>
          </table>

          <h3>Characters</h3>
          {accountState.data.characters.length > 0 ? (
            <table className="vertical-table">
              <thead>
                <tr>
                    <th>Name</th>
                    <th>Class ID</th>
                    <th>Base Lv</th>
                  <th>Job Lv</th>
                  <th>Zeny</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {accountState.data.characters.map((character) => (
                  <tr key={character.charId}>
                    <td><Link to={`/character/view/${character.charId}`}>{character.name}</Link></td>
                    <td>{character.jobName || character.jobClass}</td>
                    <td>{character.baseLevel}</td>
                    <td>{character.jobLevel}</td>
                    <td>{character.zeny}</td>
                    <td>{character.online ? "Online" : "Offline"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No characters found for this account.</p>
          )}

          <p>
            <Link to="/server/status">Back to server status</Link>
          </p>
        </>
      ) : null}
    </>
  );
}
