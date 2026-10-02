import Sidebar from "../components/Sidebar";
import "./Dashboard.css";

function Dashboard() {
  return (
    <div className="dashboard-layout">

      <Sidebar active="dashboard" />

      <main className="dashboard-main">

        <div className="topbar">
          <div></div>

          <div className="top-actions">
            <span>?</span>
            <span>♢</span>
          </div>
        </div>

        <section className="dashboard-content">

          <div className="dashboard-header">
            <div>
              <span className="eyebrow">
                VISTA EJECUTIVA
              </span>

              <h1>Portafolio Anual 2026</h1>

              <p>
                Visión general de todas las auditorías,
                riesgos y progreso del portafolio.
              </p>
            </div>

            <button className="customize-button">
              ☷ Personalizar
            </button>
          </div>

          <div className="kpi-grid">

            <div className="kpi-card">
              <span className="kpi-label">
                AUDITORÍAS TOTALES
              </span>

              <div className="kpi-row">
                <div>
                  <strong>7</strong>
                  <p>Auditorías en el plan anual</p>
                </div>

                <div className="kpi-icon">
                  ▥
                </div>
              </div>
            </div>

            <div className="kpi-card">
              <span className="kpi-label">
                AUDITORÍAS ACTIVAS
              </span>

              <div className="kpi-row">
                <div>
                  <strong>4</strong>
                  <p>
                    Auditorías fuera de planeación
                    y cierre
                  </p>
                </div>

                <div className="kpi-icon green">
                  〽
                </div>
              </div>
            </div>

            <div className="kpi-card">
              <span className="kpi-label">
                AVANCE PROMEDIO
              </span>

              <div className="kpi-row">
                <div>
                  <strong>64%</strong>
                  <p>
                    Progreso ponderado del portafolio
                  </p>
                </div>

                <div className="kpi-icon green">
                  ↗
                </div>
              </div>
            </div>

            <div className="kpi-card">
              <span className="kpi-label">
                HALLAZGOS ABIERTOS
              </span>

              <div className="kpi-row">
                <div>
                  <strong>4</strong>
                  <p>
                    Excepciones pendientes de resolver
                  </p>
                </div>

                <div className="kpi-icon warning">
                  !
                </div>
              </div>
            </div>

            <div className="kpi-card">
              <span className="kpi-label">
                RIESGOS CRÍTICOS
              </span>

              <div className="kpi-row">
                <div>
                  <strong>1</strong>
                  <p>
                    Riesgos con mayor prioridad
                  </p>
                </div>

                <div className="kpi-icon warning">
                  △
                </div>
              </div>
            </div>

            <div className="kpi-card">
              <span className="kpi-label">
                EJECUCIÓN DE HORAS
              </span>

              <div className="kpi-row">
                <div>
                  <strong>58%</strong>
                  <p>948 / 1,640 h</p>
                </div>

                <div className="kpi-icon">
                  ◷
                </div>
              </div>
            </div>

          </div>

          <div className="section-header">
            <h2>
              Panorama de riesgos y auditorías
            </h2>

            <p>
              Prioriza la atención según impacto,
              probabilidad, severidad y estado del portafolio.
            </p>
          </div>

          <div className="lower-grid">
            <div className="placeholder-card">
              <h3>Matriz de Riesgos 5×5</h3>
              <p>
                Visualización de riesgos del portafolio.
              </p>
            </div>

            <div className="placeholder-card">
              <h3>Hallazgos por severidad</h3>
              <p>
                Resumen de hallazgos abiertos.
              </p>
            </div>
          </div>

        </section>
      </main>
    </div>
  );
}

export default Dashboard;