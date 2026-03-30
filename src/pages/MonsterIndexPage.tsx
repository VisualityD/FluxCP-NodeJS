import { FormEvent, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAsyncData } from "../hooks/useAsyncData";
import { api } from "../lib/api";

export function MonsterIndexPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [form, setForm] = useState({
    monsterId: searchParams.get("monsterId") ?? "",
    name: searchParams.get("name") ?? "",
    mvp: searchParams.get("mvp") ?? ""
  });

  const monsterIdValue =
    searchParams.get("monsterId") && searchParams.get("monsterId")?.trim()
      ? Number(searchParams.get("monsterId"))
      : null;

  const monstersState = useAsyncData(
    () =>
      api.searchMonsters({
        monsterId: monsterIdValue && Number.isFinite(monsterIdValue) ? monsterIdValue : null,
        name: searchParams.get("name") ?? "",
        mvp: searchParams.get("mvp") ?? ""
      }),
    [searchParams.toString()]
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (form.monsterId.trim()) params.set("monsterId", form.monsterId.trim());
    if (form.name.trim()) params.set("name", form.name.trim());
    if (form.mvp) params.set("mvp", form.mvp);
    setSearchParams(params);
  }

  return (
    <>
      <h2>Monsters</h2>
      <form className="search-form" onSubmit={handleSubmit}>
        <p>
          <label htmlFor="monster_id">Monster ID:</label>{" "}
          <input
            id="monster_id"
            type="text"
            value={form.monsterId}
            onChange={(event) => setForm((current) => ({ ...current, monsterId: event.target.value }))}
          />{" "}
          <label htmlFor="monster_name">Name:</label>{" "}
          <input
            id="monster_name"
            type="text"
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          />{" "}
          <label htmlFor="monster_mvp">MVP:</label>{" "}
          <select
            id="monster_mvp"
            value={form.mvp}
            onChange={(event) => setForm((current) => ({ ...current, mvp: event.target.value }))}
          >
            <option value="">All</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>{" "}
          <button type="submit">Search</button>{" "}
          <button
            type="button"
            onClick={() => {
              setForm({ monsterId: "", name: "", mvp: "" });
              setSearchParams({});
            }}
          >
            Reset
          </button>
        </p>
      </form>

      {monstersState.loading ? <p className="notice">Loading monsters...</p> : null}
      {monstersState.error ? <p className="red">{monstersState.error}</p> : null}
      {monstersState.data ? (
        monstersState.data.length > 0 ? (
          <table className="horizontal-table" width="100%">
            <thead>
              <tr>
                <th>Monster ID</th>
                <th>iRO Name</th>
                <th>kRO Name</th>
                <th>Level</th>
                <th>HP</th>
                <th>Size</th>
                <th>Race</th>
                <th>Element</th>
                <th>Base EXP</th>
                <th>Job EXP</th>
                <th>Custom</th>
              </tr>
            </thead>
            <tbody>
              {monstersState.data.map((monster) => (
                <tr key={monster.monsterId}>
                  <td><Link to={`/monster/view/${monster.monsterId}`}>{monster.monsterId}</Link></td>
                  <td>{monster.isMvp ? <strong>MVP! </strong> : null}{monster.nameEnglish}</td>
                  <td>{monster.nameJapanese}</td>
                  <td>{monster.level}</td>
                  <td>{monster.hp}</td>
                  <td>{monster.size}</td>
                  <td>{monster.race}</td>
                  <td>{monster.element}</td>
                  <td>{monster.baseExp}</td>
                  <td>{monster.jobExp}</td>
                  <td>{monster.custom ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No monsters found.</p>
        )
      ) : null}
    </>
  );
}
