import { useAsyncData } from "../hooks/useAsyncData";
import { api } from "../lib/api";

export function WoePage() {
  const { data, loading, error } = useAsyncData(api.getWoeSchedule, []);

  return (
    <>
      <h2>War of Emperium Hours</h2>
      {loading ? <p className="notice">Loading WoE schedule...</p> : null}
      {error ? <p className="red">{error}</p> : null}
      {data ? (
        data.length > 0 ? (
          <>
            <p>These schedules are loaded from the current FluxCP / rAthena server configuration.</p>
            {data.map((schedule) => (
              <div key={schedule.serverName}>
                <p>
                  Server time for <strong>{schedule.serverName}</strong>: <strong>{schedule.serverTime}</strong>.
                </p>
                <table className="vertical-table">
                  <thead>
                    <tr>
                      <th>Server</th>
                      <th>Start</th>
                      <th>End</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedule.entries.map((entry, index) => (
                      <tr key={`${schedule.serverName}-${index}`}>
                        <td>{schedule.serverName}</td>
                        <td>
                          {entry.startingDay} @ {entry.startingHour}
                        </td>
                        <td>
                          {entry.endingDay} @ {entry.endingHour}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </>
        ) : (
          <p>No War of Emperium schedule has been configured.</p>
        )
      ) : null}
    </>
  );
}
