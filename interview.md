# React Interview Q&A

> All answers reference this repo (`jaricardodev/react-dot-net`) as a concrete example.

---

## Core React Concepts

### 1. What is the Virtual DOM, and how does it work?

The **Virtual DOM** is a lightweight JavaScript representation of the real DOM tree. React keeps this in memory and uses it as a fast "scratchpad."

**How reconciliation works:**
1. When state or props change, React re-renders the component into a *new* Virtual DOM tree.
2. It **diffs** the new tree against the previous one (the reconciliation algorithm), finding the minimum set of changes needed.
3. Only those real DOM mutations are applied — React never touches DOM nodes that haven't changed.

**In this repo:** Every time `setForecast`, `setLoading`, or `setError` is called in `app.js`, React re-renders the `App` component into a new Virtual DOM tree and patches only what changed in the actual `<div id="root">`.

---

### 2. Props vs. State

| | Props | State |
|---|---|---|
| Owned by | Parent component | The component itself |
| Mutable? | No (read-only) | Yes (via setter) |
| Triggers re-render? | Yes (when parent re-renders) | Yes (when setter is called) |

**In this repo:** `app.js` has no parent passing props down, so all data is **state** — `forecast`, `loading`, and `error` are all declared with `React.useState`. If `App` had a child component like `<ForecastRow item={item} />`, then `item` would be a **prop** inside `ForecastRow`.

---

### 3. Hooks

Hooks let functional components use React features that used to require class components.

| Hook | Purpose | In this repo |
|---|---|---|
| `useState` | Local component state | `forecast`, `loading`, `error` — lines 4–6 in `app.js` |
| `useEffect` | Side effects (data fetching, subscriptions, DOM updates) | The `fetch` call on lines 8–25 |
| `useContext` | Consume a React context without prop-drilling | Not used here, but ideal for sharing auth/theme across components |
| `useRef` | Persistent mutable value / DOM node access | Not used here |
| `useMemo` | Memoize an expensive computed value | Not used here |
| `useCallback` | Memoize a function reference | Not used here |

---

### 4. JSX and How It Gets Transformed

**JSX** is syntactic sugar that looks like HTML inside JavaScript. Babel transpiles it into `React.createElement` calls before the browser ever sees it.

```jsx
// What you write (JSX):
<tr key={item.date}>
  <td>{item.date}</td>
</tr>

// What Babel produces:
React.createElement("tr", { key: item.date },
  React.createElement("td", null, item.date)
)
```

**This repo skips JSX entirely.** At the top of `app.js`:
```js
const h = React.createElement;
```
Every UI element is built with explicit `h(...)` calls. This is exactly the output Babel would produce — there's no compilation step needed, which is why the file can be served as a plain `.js` file from `wwwroot` and loaded directly in the browser via `<script src="/app.js">`.

---

### 5. Forms and Events — Controlled vs. Uncontrolled

- **Controlled component:** React state *is* the source of truth. Every keystroke calls `setState`, and the input's `value` is always driven by state. You get full control over validation and formatting.
- **Uncontrolled component:** The DOM holds the value; you read it with a `ref` only when needed (e.g., on submit).

This repo has no form — it's purely a read-only data display. But if we added a city search:
```js
// Controlled:
const [city, setCity] = React.useState("");
h("input", { value: city, onChange: e => setCity(e.target.value) })

// Uncontrolled:
const inputRef = React.useRef();
h("input", { ref: inputRef })  // read inputRef.current.value on submit
```

---

### 6. Keys in Lists

Keys are **stable, unique identifiers** on list items that tell React *which* Virtual DOM node maps to which rendered element. Without them, React falls back to positional diffing — inserting an item at the top would cause every row to re-render.

**In this repo (`app.js`, line 56):**
```js
h("tr", { key: item.date }, ...)
```
`item.date` is the key for each `<tr>`. When the forecast array updates, React can match each row to its previous render by date instead of re-rendering the whole table.

> ⚠️ Keys should be stable IDs, not array indices, to avoid subtle bugs during reordering or insertions.

---

## Hooks and Functional Components

### 7. `useEffect` and Lifecycle Equivalents

`useEffect(fn, deps)` runs `fn` after React commits the render to the DOM.

| Class lifecycle | `useEffect` equivalent |
|---|---|
| `componentDidMount` | `useEffect(() => { ... }, [])` — empty deps, runs once |
| `componentDidUpdate` | `useEffect(() => { ... }, [dep])` — runs when `dep` changes |
| `componentWillUnmount` | Return a cleanup function from the effect |

**In this repo:**
```js
React.useEffect(() => {
  fetch("/weatherforecast")
    ...
}, []);  // ← empty array = componentDidMount equivalent
```
The empty dependency array means "run once after the first render" — exactly what you'd put in `componentDidMount`. If we added a `city` state and wanted to re-fetch when it changes, we'd write `}, [city])`.

A cleanup example (not in this repo) would be:
```js
useEffect(() => {
  const id = setInterval(refetch, 30000);
  return () => clearInterval(id);  // componentWillUnmount
}, []);
```

---

### 8. `useRef`

`useRef` returns a mutable object `{ current: value }` that:
1. **Persists across renders** (unlike a local variable)
2. **Does NOT trigger a re-render** when mutated (unlike state)

Two main uses:
- **DOM access:** `ref={myRef}` on an element, then `myRef.current.focus()`
- **Storing a previous value / timer ID / flag** without causing re-renders

Not used in this repo (no DOM manipulation needed), but if we wanted to auto-focus a search input on mount:
```js
const inputRef = React.useRef(null);
React.useEffect(() => { inputRef.current.focus(); }, []);
h("input", { ref: inputRef })
```

---

### 9. Avoiding Unnecessary Re-renders

| Tool | What it does |
|---|---|
| `React.memo(Component)` | Wraps a component; skips re-render if props are shallowly equal |
| `useMemo(() => val, [deps])` | Caches a computed value; only recomputes when deps change |
| `useCallback(() => fn, [deps])` | Caches a function reference; prevents child re-renders caused by new function refs |

**In this repo:** With just one component, there's nothing to memoize. If we extracted a `ForecastRow` component:
```js
const ForecastRow = React.memo(function ForecastRow({ item }) {
  return h("tr", null, h("td", null, item.date), ...);
});
```
Now `ForecastRow` only re-renders when its specific `item` changes, not whenever the parent `App` re-renders.

---

### 10. Sharing State Between Components

From simplest to most powerful:

1. **Lift state up** — Move state to the closest common ancestor and pass it down via props. Best for small, co-located component trees.
2. **Context API** (`useContext`) — Broadcast state to any descendant without prop-drilling. Good for app-wide concerns like theme, locale, auth.
3. **Redux / Zustand / Jotai** — External state management for complex global state with many updates or cross-cutting concerns.

**In this repo:** All state lives in `App` (already at the top), so nothing needs to be lifted. If we split it into `<ForecastTable>` and `<ErrorMessage>`, `App` would own `forecast`/`loading`/`error` and pass them as props — that's "lifting state up."

---

## Advanced & Architectural Questions

### 11. React Fiber

**React Fiber** is the reconciliation engine rewritten in React 16 (the old one was a synchronous recursive "stack reconciler"). Key ideas:

- Work is broken into small **units of work** that can be **paused, prioritized, restarted, or abandoned**.
- This enables **Concurrent Mode** features: `startTransition`, `Suspense`, time-slicing.
- Renders are now two-phase: **render phase** (pure, interruptible) → **commit phase** (synchronous, applies DOM mutations).

**Practical impact on this repo:** `ReactDOM.createRoot(...)` (line 67 in `app.js`) is the React 18 API that opts into Concurrent Mode — as opposed to the legacy `ReactDOM.render`. This means React can batch the three state setters (`setForecast`, `setLoading`, `setError`) from inside the `.finally`/`.then`/`.catch` callbacks into a single re-render automatically.

---

### 12. Optimizing React Performance

| Technique | How |
|---|---|
| **Reduce re-renders** | `React.memo`, `useMemo`, `useCallback` |
| **Code splitting** | `React.lazy(() => import('./Component'))` + `<Suspense>` |
| **Lazy loading routes** | Same as above, per-route |
| **Virtualization** | `react-window` / `react-virtual` for huge lists |
| **Avoid inline objects/functions** | They create new references every render, defeating `memo` |
| **Batching** | React 18 auto-batches state updates even in async callbacks |

**In this repo:** The table renders only 5 rows, so performance isn't a concern. In a production app with thousands of rows you'd virtualize the list and memoize `ForecastRow`.

---

### 13. Controlled vs. Uncontrolled Components (deeper dive)

Already covered in Q5. The key interview point:

- **Controlled** is React-idiomatic and easier to validate, format, and test, but adds verbosity.
- **Uncontrolled** is simpler for file inputs (`<input type="file">` can never be fully controlled) and one-off forms where you only care about the final value.
- Libraries like `react-hook-form` use **uncontrolled components with refs** under the hood for performance, while still giving you a controlled-feeling API.

---

### 14. Handling API Calls and Errors

**In this repo (`app.js`, lines 8–25) — a clean, complete pattern:**

```js
React.useEffect(() => {
  fetch("/weatherforecast")
    .then((response) => {
      if (!response.ok) {                          // ← check HTTP error status
        throw new Error(`Request failed with status ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      setForecast(data);                           // ← success: store data
    })
    .catch((err) => {
      setError(err.message);                       // ← network or HTTP error
    })
    .finally(() => {
      setLoading(false);                           // ← always stop spinner
    });
}, []);
```

Then the render uses three states:
- `loading === true` → show spinner
- `error !== ""` → show error message with `.error` CSS class
- otherwise → render the table

For production, you'd also consider:
- **Abort controllers** (`AbortController`) to cancel the fetch if the component unmounts before it completes (avoids "setState on unmounted component" warnings).
- **Error boundaries** (class components wrapping a subtree) to catch render-time errors.
- Dedicated data-fetching libraries like **React Query / TanStack Query** or **SWR** that handle caching, retries, deduplication, and background refresh automatically.
