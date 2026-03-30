import { useSearchParams, Link } from "react-router-dom";
import { useAsyncData } from "../hooks/useAsyncData";
import { api } from "../lib/api";

const JOB_FILTERS = [
  { value: "", label: "All" },
  { value: "0", label: "Novice" },
  { value: "1", label: "Swordsman" },
  { value: "2", label: "Mage" },
  { value: "3", label: "Archer" },
  { value: "4", label: "Acolyte" },
  { value: "5", label: "Merchant" },
  { value: "6", label: "Thief" },
  { value: "7", label: "Knight" },
  { value: "8", label: "Priest" },
  { value: "9", label: "Wizard" },
  { value: "10", label: "Blacksmith" },
  { value: "11", label: "Hunter" },
  { value: "12", label: "Assassin" },
  { value: "23", label: "Super Novice" },
  { value: "24", label: "Gunslinger" },
  { value: "25", label: "Ninja" },
  { value: "4054", label: "Rune Knight" },
  { value: "4055", label: "Warlock" },
  { value: "4056", label: "Ranger" },
  { value: "4057", label: "Arch Bishop" },
  { value: "4058", label: "Mechanic" },
  { value: "4059", label: "Guillotine Cross" },
  { value: "4066", label: "Royal Guard" },
  { value: "4067", label: "Sorcerer" },
  { value: "4070", label: "Sura" },
  { value: "4071", label: "Genetic" }
];

export function CharacterRankingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedJobClass = searchParams.get("jobClass");
  const selectedJobClassNumber =
    selectedJobClass && selectedJobClass.trim() !== "" ? Number(selectedJobClass) : null;

  const rankingState = useAsyncData(
    () => api.getCharacterRanking(Number.isFinite(selectedJobClassNumber) ? selectedJobClassNumber : null),
    [selectedJobClass]
  );

  return (
    <>
      <h2>Character Ranking</h2>
      <h3>Top Characters</h3>
      <form className="search-form2">
        <p>
          <label htmlFor="jobclass">Filter by job class:</label>{" "}
          <select
            id="jobclass"
            value={selectedJobClass ?? ""}
            onChange={(event) => {
              const value = event.target.value;
              setSearchParams(value ? { jobClass: value } : {});
            }}
          >
            {JOB_FILTERS.map((job) => (
              <option key={job.value || "all"} value={job.value}>
                {job.label}
              </option>
            ))}
          </select>
        </p>
      </form>

      {rankingState.loading ? <p className="notice">Loading ranking...</p> : null}
      {rankingState.error ? <p className="red">{rankingState.error}</p> : null}
      {rankingState.data ? (
        rankingState.data.length > 0 ? (
          <table className="horizontal-table" width="100%">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Character Name</th>
                <th>Job Class</th>
                <th>Guild Name</th>
                <th>Base Level</th>
                <th>Job Level</th>
                <th>Base Experience</th>
                <th>Job Experience</th>
              </tr>
            </thead>
            <tbody>
              {rankingState.data.map((entry) => (
                <tr key={entry.charId}>
                  <td>{entry.rank}</td>
                  <td><Link to={`/character/view/${entry.charId}`}>{entry.name}</Link></td>
                  <td>{entry.jobName}</td>
                  <td>{entry.guildName || "None"}</td>
                  <td>{entry.baseLevel}</td>
                  <td>{entry.jobLevel}</td>
                  <td>{entry.baseExp}</td>
                  <td>{entry.jobExp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>There are no characters.</p>
        )
      ) : null}
    </>
  );
}
