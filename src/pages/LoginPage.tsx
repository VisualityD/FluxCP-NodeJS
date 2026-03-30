import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

export function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.login(username, password);
      navigate("/");
      window.location.reload();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h2>Login</h2>
      {error ? <p className="red">{error}</p> : <p>Enter your account credentials to access the control panel.</p>}
      <form onSubmit={handleSubmit} className="generic-form">
        <table className="generic-form-table">
          <tbody>
            <tr>
              <th>
                <label htmlFor="login_username">Username</label>
              </th>
              <td>
                <input
                  type="text"
                  id="login_username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                />
              </td>
            </tr>
            <tr>
              <th>
                <label htmlFor="login_password">Password</label>
              </th>
              <td>
                <input
                  type="password"
                  id="login_password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </td>
            </tr>
            <tr>
              <td />
              <td>
                <input type="submit" value={loading ? "Signing in..." : "Login"} disabled={loading} />
              </td>
            </tr>
          </tbody>
        </table>
      </form>
    </>
  );
}
