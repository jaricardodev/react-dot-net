# React + .NET WeatherForecast Sample

This repository shows a simple setup where:

- **ASP.NET Core** hosts the API (`/weatherforecast`) using the default WeatherForecast template.
- **React** is served as **static files** from `wwwroot` by the same .NET app.

## Prerequisites

### Required tools

- [.NET SDK 10](https://dotnet.microsoft.com/download)
- [Visual Studio Code](https://code.visualstudio.com/)

### Recommended VS Code extensions

- **C# Dev Kit** (`ms-dotnettools.csdevkit`)
- **C#** (`ms-dotnettools.csharp`)
- **JavaScript and TypeScript Nightly** (`ms-vscode.vscode-typescript-next`) *(optional but useful for JS/React intellisense)*
- **ESLint** (`dbaeumer.vscode-eslint`) *(optional for JS linting workflows)*

## How this project was created

```bash
dotnet new webapi --force
```

Then these additions were made:

1. Enabled static file hosting in `Program.cs` with:
   - `app.UseDefaultFiles();`
   - `app.UseStaticFiles();`
2. Added React static files:
   - `wwwroot/index.html`
   - `wwwroot/app.js`
3. React frontend calls the API endpoint:
   - `fetch('/weatherforecast')`

## Run the project

From the repository root:

```bash
dotnet run
```

The app will print local URLs (for example `https://localhost:7xxx`).

Open the URL in your browser:

- `/` shows the React UI
- `/weatherforecast` returns WeatherForecast JSON from .NET API

## Project structure

- `Program.cs` - API + static file hosting setup
- `wwwroot/index.html` - static page loading React
- `wwwroot/app.js` - React app that fetches weather data
