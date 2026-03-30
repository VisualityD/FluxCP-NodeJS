import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

export function CreateAccountPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    email: "",
    confirmEmail: "",
    gender: "M",
    birthdate: ""
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function updateField(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.register(form);
      navigate("/account/view");
      window.location.reload();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h2>Create Account</h2>
      <p>Your password should match the classic FluxCP rules from the original project.</p>
      {error ? <p className="red">{error}</p> : null}
      <form onSubmit={handleSubmit} className="generic-form">
        <table className="generic-form-table">
          <tbody>
            <tr>
              <th><label htmlFor="register_username">Username</label></th>
              <td><input id="register_username" type="text" value={form.username} onChange={(event) => updateField("username", event.target.value)} /></td>
            </tr>
            <tr>
              <th><label htmlFor="register_password">Password</label></th>
              <td><input id="register_password" type="password" value={form.password} onChange={(event) => updateField("password", event.target.value)} /></td>
            </tr>
            <tr>
              <th><label htmlFor="register_confirm_password">Confirm Password</label></th>
              <td><input id="register_confirm_password" type="password" value={form.confirmPassword} onChange={(event) => updateField("confirmPassword", event.target.value)} /></td>
            </tr>
            <tr>
              <th><label htmlFor="register_email">Email</label></th>
              <td><input id="register_email" type="text" value={form.email} onChange={(event) => updateField("email", event.target.value)} /></td>
            </tr>
            <tr>
              <th><label htmlFor="register_email_confirm">Confirm Email</label></th>
              <td><input id="register_email_confirm" type="text" value={form.confirmEmail} onChange={(event) => updateField("confirmEmail", event.target.value)} /></td>
            </tr>
            <tr>
              <th>Gender</th>
              <td>
                <label>
                  <input type="radio" name="gender" value="M" checked={form.gender === "M"} onChange={(event) => updateField("gender", event.target.value)} /> Male
                </label>{" "}
                <label>
                  <input type="radio" name="gender" value="F" checked={form.gender === "F"} onChange={(event) => updateField("gender", event.target.value)} /> Female
                </label>
              </td>
            </tr>
            <tr>
              <th><label htmlFor="register_birthdate">Birthdate</label></th>
              <td><input id="register_birthdate" type="date" value={form.birthdate} onChange={(event) => updateField("birthdate", event.target.value)} /></td>
            </tr>
            <tr>
              <td />
              <td><button type="submit" disabled={loading}>{loading ? "Creating..." : "Create Account"}</button></td>
            </tr>
          </tbody>
        </table>
      </form>
    </>
  );
}
