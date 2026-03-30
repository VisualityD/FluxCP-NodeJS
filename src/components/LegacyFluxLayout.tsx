import { Fragment, useEffect } from "react";
import { NavLink, Outlet } from "react-router-dom";
import type { LayoutPayload } from "../types";
import { useAsyncData } from "../hooks/useAsyncData";
import { api } from "../lib/api";

type ThemeSelectorProps = {
  currentTheme: "default" | "bootstrap";
  availableThemes: Array<"default" | "bootstrap">;
  compact?: boolean;
};

function ThemeSelector({ currentTheme, availableThemes, compact }: ThemeSelectorProps) {
  async function handleThemeChange(nextTheme: "default" | "bootstrap") {
    await api.setTheme(nextTheme);
    window.location.reload();
  }

  return (
    <label className={compact ? "bootstrap-theme-selector" : undefined}>
      Theme:{" "}
      <select
        name="preferred_theme"
        value={currentTheme}
        onChange={(event) => void handleThemeChange(event.target.value as "default" | "bootstrap")}
      >
        {availableThemes.map((themeName) => (
          <option key={themeName} value={themeName}>
            {themeName}
          </option>
        ))}
      </select>
    </label>
  );
}

type ShellProps = {
  layout: LayoutPayload;
  loading: boolean;
  error: string | null;
  onLogout: () => Promise<void>;
};

function DefaultThemeShell({ layout, loading, error, onLogout }: ShellProps) {
  return (
    <div className="flux-theme-default">
      <table cellSpacing="0" cellPadding="0" width="100%">
        <tbody>
          <tr>
            <td style={{ backgroundColor: "#8ebceb" }} width="20" />
            <td style={{ backgroundColor: "#8ebceb" }} colSpan={3}>
              <NavLink to="/">
                <img src="/legacy-theme/img/logo.gif" id="logo" />
              </NavLink>
            </td>
            <td style={{ backgroundColor: "#8ebceb" }} width="20" />
          </tr>
          <tr>
            <td colSpan={3} height="20" />
          </tr>
          <tr>
            <td style={{ padding: "10px" }} />
            <td width="198">
              <table id="sidebar" cellSpacing="0" cellPadding="0">
                <tbody>
                  <tr>
                    <td>
                      <img src="/legacy-theme/img/sidebar_complete_top.gif" />
                    </td>
                  </tr>
                  {layout.menuSections.map((section) => (
                    <Fragment key={section.title}>
                      <tr>
                        <th className="menuitem">
                          <strong>{section.title}</strong>
                        </th>
                      </tr>
                      {section.items.map((item) => (
                        <tr key={item.url}>
                          <td className="menuitem">
                            <NavLink to={item.url}>
                              <span>{item.name}</span>
                            </NavLink>
                          </td>
                        </tr>
                      ))}
                    </Fragment>
                  ))}
                  <tr>
                    <td>
                      <img src="/legacy-theme/img/sidebar_complete_bottom.gif" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
            <td style={{ padding: "10px" }} />
            <td width="100%">
              {layout.user ? (
                <table cellSpacing="0" cellPadding="0" width="100%" id="loginbox">
                  <tbody>
                    <tr>
                      <td width="18">
                        <img src="/legacy-theme/img/loginbox_tl.gif" style={{ display: "block" }} />
                      </td>
                      <td style={{ backgroundColor: "#e1eaf3" }} />
                      <td width="18">
                        <img src="/legacy-theme/img/loginbox_tr.gif" style={{ display: "block" }} />
                      </td>
                    </tr>
                    <tr>
                      <td style={{ backgroundColor: "#e1eaf3" }} />
                      <td style={{ backgroundColor: "#e1eaf3", verticalAlign: "middle" }}>
                        You are currently logged in as <strong>{layout.user.username}</strong> on {layout.user.serverName}.{" "}
                        <button type="button" className="flux-link-button" onClick={() => void onLogout()}>
                          Logout
                        </button>
                      </td>
                      <td style={{ backgroundColor: "#e1eaf3" }} />
                    </tr>
                    <tr>
                      <td>
                        <img src="/legacy-theme/img/loginbox_bl.gif" style={{ display: "block" }} />
                      </td>
                      <td style={{ backgroundColor: "#e1eaf3" }} />
                      <td>
                        <img src="/legacy-theme/img/loginbox_br.gif" style={{ display: "block" }} />
                      </td>
                    </tr>
                  </tbody>
                </table>
              ) : null}

              <table cellSpacing="0" cellPadding="0" width="100%" id="content">
                <tbody>
                  <tr>
                    <td width="18">
                      <img src="/legacy-theme/img/content_tl.gif" style={{ display: "block" }} />
                    </td>
                    <td style={{ backgroundColor: "#f5f5f5" }} />
                    <td width="18">
                      <img src="/legacy-theme/img/content_tr.gif" style={{ display: "block" }} />
                    </td>
                  </tr>
                  <tr>
                    <td style={{ backgroundColor: "#f5f5f5" }} />
                    <td style={{ backgroundColor: "#f5f5f5" }}>
                      <h2>{layout.siteTitle}</h2>
                      {loading ? <p className="notice">Loading layout...</p> : null}
                      {error ? <p className="red">{error}</p> : null}
                      <Outlet />
                    </td>
                    <td style={{ backgroundColor: "#f5f5f5" }} />
                  </tr>
                  <tr>
                    <td>
                      <img src="/legacy-theme/img/content_bl.gif" style={{ display: "block" }} />
                    </td>
                    <td style={{ backgroundColor: "#f5f5f5" }} />
                    <td>
                      <img src="/legacy-theme/img/content_br.gif" style={{ display: "block" }} />
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
            <td style={{ padding: "10px" }} />
          </tr>
          <tr>
            <td colSpan={3} />
            <td id="copyright">
              <p>
                <strong>
                  Powered by <a href="https://github.com/rathena/FluxCP">FluxCP</a>
                </strong>
              </p>
              <p>
                <ThemeSelector currentTheme={layout.currentTheme} availableThemes={layout.availableThemes} />
              </p>
            </td>
            <td />
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function BootstrapThemeShell({ layout, loading, error, onLogout }: ShellProps) {
  return (
    <div className="flux-theme-bootstrap">
      <header className="bootstrap-navbar bootstrap-navbar-inverse bootstrap-navbar-fixed-top">
        <div className="bootstrap-container bootstrap-navbar-shell">
          <div className="bootstrap-navbar-header">
            <NavLink to="/" className="bootstrap-navbar-brand">
              {layout.siteTitle}
            </NavLink>
          </div>
          <nav className="bootstrap-navbar-collapse">
            <ul className="bootstrap-nav bootstrap-navbar-nav">
              {layout.menuSections.map((section) => (
                <li key={section.title} className="bootstrap-dropdown">
                  <details className="bootstrap-nav-group">
                    <summary>
                      {section.title} <b className="bootstrap-caret" />
                    </summary>
                    <div className="bootstrap-dropdown-menu">
                      {section.items.map((item) => (
                        <NavLink
                          key={item.url}
                          to={item.url}
                          className={({ isActive }) => `bootstrap-nav-link${isActive ? " is-active" : ""}`}
                        >
                          {item.name}
                        </NavLink>
                      ))}
                    </div>
                  </details>
                </li>
              ))}
            </ul>
          </nav>
          <div className="bootstrap-navbar-right bootstrap-user-meta">
            {layout.user ? (
              <>
                <span>
                  Logged in as <strong>{layout.user.username}</strong>
                </span>
                <button type="button" className="bootstrap-ghost-button" onClick={() => void onLogout()}>
                  Logout
                </button>
              </>
            ) : (
              <NavLink to="/account/login" className="bootstrap-ghost-button bootstrap-link-button">
                Login
              </NavLink>
            )}
          </div>
        </div>
      </header>

      <main className="bootstrap-container bootstrap-shell-main">
        {layout.user ? (
          <section className="bootstrap-info-banner">
            You are currently logged in as <strong>{layout.user.username}</strong> on {layout.user.serverName}.
          </section>
        ) : null}
        <section className="bootstrap-panel">
          <h2>{layout.siteTitle}</h2>
          {loading ? <p className="notice">Loading layout...</p> : null}
          {error ? <p className="red">{error}</p> : null}
          <Outlet />
        </section>
      </main>

      <footer id="footer" className="bootstrap-shell-footer">
        <div className="bootstrap-container bootstrap-shell-footer-inner">
          <p className="text-muted">
            <strong>
              Powered by <a href="https://github.com/rathena/FluxCP">FluxCP</a>
            </strong>
          </p>
          <ThemeSelector
            currentTheme={layout.currentTheme}
            availableThemes={layout.availableThemes}
            compact
          />
        </div>
      </footer>
    </div>
  );
}

export function LegacyFluxLayout() {
  const { data, loading, error } = useAsyncData(api.getLayout, []);
  const layout: LayoutPayload = data ?? {
    siteTitle: "Flux Control Panel",
    menuSections: [],
    currentTheme: "default",
    availableThemes: ["default", "bootstrap"],
    user: null
  };

  useEffect(() => {
    document.body.classList.remove("theme-default", "theme-bootstrap");
    document.body.classList.add(layout.currentTheme === "bootstrap" ? "theme-bootstrap" : "theme-default");

    return () => {
      document.body.classList.remove("theme-default", "theme-bootstrap");
    };
  }, [layout.currentTheme]);

  async function handleLogout() {
    await api.logout();
    window.location.reload();
  }

  if (layout.currentTheme === "bootstrap") {
    return <BootstrapThemeShell layout={layout} loading={loading} error={error} onLogout={handleLogout} />;
  }

  return <DefaultThemeShell layout={layout} loading={loading} error={error} onLogout={handleLogout} />;
}
