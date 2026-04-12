# Expense Log

A static expense tracker that is ready to upload to GitHub and publish with GitHub Pages.

## Features

- Add expenses with title, amount, category, date, and notes
- Save entries in browser storage
- Export all entries as `.csv`
- Open the exported file in Excel or import it into Google Sheets
- Publish as a simple static site with no build step

## Project structure

```text
.
├── index.html
├── README.md
├── .gitignore
├── .nojekyll
└── assets
    ├── css
    │   └── styles.css
    └── js
        └── app.js
```

## Run locally

Open `index.html` in your browser.

## Upload to GitHub

1. Create a new repository on GitHub.
2. Upload all files in this folder.
3. Commit the files.
4. In GitHub, go to `Settings` -> `Pages`.
5. Under `Build and deployment`, choose:
   - `Source`: `Deploy from a branch`
   - `Branch`: `main`
   - `Folder`: `/root`
6. Save the settings.
7. GitHub will give you a public URL for the page.

## Notes

- Data is stored in the browser, not in GitHub.
- If you clear browser storage, the local data is removed.
- If you want multi-device access with shared data, the next step is connecting this to Google Sheets or a database.
