import { Link, Navigate, useParams } from "react-router-dom";
import { useAsyncData } from "../hooks/useAsyncData";
import { api } from "../lib/api";

export function MonsterViewPage() {
  const params = useParams();
  const monsterId = Number(params.id);
  const monsterState = useAsyncData(() => api.getMonster(monsterId), [monsterId]);

  if (!Number.isFinite(monsterId)) {
    return <Navigate to="/monster/index" replace />;
  }

  return (
    <>
      <h2>Viewing Monster</h2>
      {monsterState.loading ? <p className="notice">Loading monster...</p> : null}
      {monsterState.error ? <p className="red">{monsterState.error}</p> : null}
      {monsterState.data ? (
        <>
          <h3>
            #{monsterState.data.monsterId}: {monsterState.data.nameEnglish}{" "}
            {monsterState.data.isMvp ? <span className="mvp">(MVP)</span> : null}
          </h3>
          <table className="vertical-table">
            <tbody>
              <tr>
                <th>Monster ID</th>
                <td>{monsterState.data.monsterId}</td>
                <th>Sprite</th>
                <td>{monsterState.data.sprite}</td>
              </tr>
              <tr>
                <th>kRO Name</th>
                <td>{monsterState.data.nameJapanese}</td>
                <th>Custom</th>
                <td>{monsterState.data.custom ? "Yes" : "No"}</td>
              </tr>
              <tr>
                <th>iRO Name</th>
                <td>{monsterState.data.nameEnglish}</td>
                <th>HP</th>
                <td>{monsterState.data.hp}</td>
              </tr>
              <tr>
                <th>Size</th>
                <td>{monsterState.data.size}</td>
                <th>SP</th>
                <td>{monsterState.data.sp}</td>
              </tr>
              <tr>
                <th>Race</th>
                <td>{monsterState.data.race}</td>
                <th>Level</th>
                <td>{monsterState.data.level}</td>
              </tr>
              <tr>
                <th>Element</th>
                <td>{monsterState.data.element} (Lv {monsterState.data.elementLevel})</td>
                <th>Speed</th>
                <td>{monsterState.data.walkSpeed}</td>
              </tr>
              <tr>
                <th>Base EXP</th>
                <td>{monsterState.data.baseExp}</td>
                <th>Attack</th>
                <td>{monsterState.data.attack}~{monsterState.data.attack2}</td>
              </tr>
              <tr>
                <th>Job EXP</th>
                <td>{monsterState.data.jobExp}</td>
                <th>Defense</th>
                <td>{monsterState.data.defense}</td>
              </tr>
              <tr>
                <th>MVP EXP</th>
                <td>{monsterState.data.mvpExp}</td>
                <th>Magic Defense</th>
                <td>{monsterState.data.magicDefense}</td>
              </tr>
              <tr>
                <th>Attack Delay</th>
                <td>{monsterState.data.attackDelay} ms</td>
                <th>Attack Range</th>
                <td>{monsterState.data.attackRange}</td>
              </tr>
              <tr>
                <th>Attack Motion</th>
                <td>{monsterState.data.attackMotion} ms</td>
                <th>Spell Range</th>
                <td>{monsterState.data.skillRange}</td>
              </tr>
              <tr>
                <th>Damage Motion</th>
                <td>{monsterState.data.damageMotion} ms</td>
                <th>Vision Range</th>
                <td>{monsterState.data.chaseRange}</td>
              </tr>
              <tr>
                <th>Monster Mode</th>
                <td colSpan={3}>{monsterState.data.mode.length > 0 ? monsterState.data.mode.join(" / ") : "None"}</td>
              </tr>
              <tr>
                <th>Stats</th>
                <td colSpan={3}>
                  STR {monsterState.data.stats.str} | AGI {monsterState.data.stats.agi} | VIT {monsterState.data.stats.vit} | INT {monsterState.data.stats.int} | DEX {monsterState.data.stats.dex} | LUK {monsterState.data.stats.luk}
                </td>
              </tr>
            </tbody>
          </table>

          <h3>{monsterState.data.nameEnglish} Item Drops</h3>
          {monsterState.data.drops.length > 0 ? (
            <table className="vertical-table">
              <thead>
                <tr>
                  <th>Item ID</th>
                  <th>Item Name</th>
                  <th>Drop Chance</th>
                  <th>Steal</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {monsterState.data.drops.map((drop) => (
                  <tr key={`${drop.itemId}-${drop.itemName}-${drop.chance}`}>
                    <td>{drop.itemId ? <Link to={`/item/view/${drop.itemId}`}>{drop.itemId}</Link> : "Unknown"}</td>
                    <td>{drop.itemName}</td>
                    <td>{drop.chance}%</td>
                    <td>{drop.canSteal ? "Yes" : "No"}</td>
                    <td>{drop.isMvp ? "MVP" : "Normal"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No item drops found for {monsterState.data.nameEnglish}.</p>
          )}

          <h3>Monster Skills</h3>
          {monsterState.data.skills.length > 0 ? (
            <table className="vertical-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Level</th>
                  <th>State</th>
                  <th>Rate</th>
                  <th>Cast</th>
                  <th>Delay</th>
                  <th>Cancelable</th>
                  <th>Target</th>
                  <th>Condition</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {monsterState.data.skills.map((skill, index) => (
                  <tr key={`${skill.name}-${skill.level}-${index}`}>
                    <td>{skill.name}</td>
                    <td>{skill.level}</td>
                    <td>{skill.state}</td>
                    <td>{skill.rate}%</td>
                    <td>{skill.castTime}s</td>
                    <td>{skill.delay}s</td>
                    <td>{skill.cancelable}</td>
                    <td>{skill.target}</td>
                    <td>{skill.condition}</td>
                    <td>{skill.conditionValue || "None"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No monster skills found.</p>
          )}

          <p><Link to="/monster/index">Back to monster list</Link></p>
        </>
      ) : null}
    </>
  );
}
