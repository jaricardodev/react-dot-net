const h = React.createElement;

function App() {
  const [forecast, setForecast] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    fetch("/weatherforecast")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setForecast(data);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return h("p", null, "Loading weather forecast...");
  }

  if (error) {
    return h("p", { className: "error" }, `Could not load weather forecast: ${error}`);
  }

  return h(
    "table",
    null,
    h(
      "thead",
      null,
      h(
        "tr",
        null,
        h("th", null, "Date"),
        h("th", null, "Temp. (C)"),
        h("th", null, "Temp. (F)"),
        h("th", null, "Summary")
      )
    ),
    h(
      "tbody",
      null,
      forecast.map((item) =>
        h(
          "tr",
          { key: item.date },
          h("td", null, item.date),
          h("td", null, item.temperatureC),
          h("td", null, item.temperatureF),
          h("td", null, item.summary)
        )
      )
    )
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(h(App));
