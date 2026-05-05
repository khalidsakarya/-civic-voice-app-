# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

---

## Executive Orders — Federal Register → Firestore

The **Executive Orders screen** reads from **`executive_actions`**: Federal Register rows where **`jurisdiction == "US"`**, **`source_name == "Federal Register"`**, the current president matches (`politician_slug` / `member_name`), and the document is classified as an **Executive Order** only (`type` allowlist and/or `presidential_document_type` / `presidentialDocumentType` slug `executive_order`). Proclamations, memoranda, notices, etc. are excluded — see `src/constants/executiveOrderDocumentTypes.js`.

Leader-profile widgets also query **`executive_actions`** by `member_name` without those EO filters — the same collection serves multiple views.

The optional **`npm run sync:us-executive-orders`** script writes to **`executive_orders`** by default (Admin SDK). To align ingestion with the UI, either point **`FIRESTORE_COLLECTION=executive_actions`** at ingest time **and** match the app’s field schema (`source_url`, `type`, …), or keep populating **`executive_actions`** via your existing Federal Register pipeline.

**Firestore index:** the EO query uses **two** equality filters (`jurisdiction`, `source_name`). If the console reports a missing index, create the composite index it suggests on **`executive_actions`**.

### Sync script

```bash
npm run sync:us-executive-orders
```

This runs `engine/sync-us-executive-orders.cjs`, which lists EO document numbers from the [Federal Register API](https://www.federalregister.gov/reader-aids/developer-resources/rest-api), fetches each document JSON, and **upserts** into Firestore (`merge: true`). Successful completion logs:  
`complete · N documents upserted into Firestore collection "executive_orders"`.

### Required credentials (pick one)

| Variable | Description |
|----------|-------------|
| **`GOOGLE_APPLICATION_CREDENTIALS`** | Absolute path to a Firebase/Google Cloud **service account JSON** file with permission to write Firestore (e.g. Cloud Datastore User or Firebase Admin). |
| **`FIREBASE_SERVICE_ACCOUNT_JSON`** | The full service account JSON as a **string** (used in CI; paste JSON as one line or use multiline secret). |

Without one of these, the script exits immediately with:  
`Set GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_SERVICE_ACCOUNT_JSON`.

### Optional environment variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `FIRESTORE_COLLECTION` | `executive_orders` | Override collection name. |
| `PRESIDENT_SLUG` | `donald-trump` | Federal Register API president filter. |
| `PRESIDENT_DISPLAY_NAME` | `Donald J. Trump` | Stored on each document. |
| `MAX_DETAIL_FETCHES` | `0` (no cap) | Limit detail fetches for testing. |
| `DETAIL_DELAY_MS` | `40` | Pause between Federal Register detail requests. |

### Production build — demo mode off

- **`REACT_APP_EXECUTIVE_ORDERS_DEMO_MODE`** — Must be **unset** or not equal to the string `true` for production so the app loads Firestore instead of the bundled demo list. Set only deliberately for demos (value must be exactly `true`; anything else uses Firestore).

### Debug: `executive_actions` type audit (client read-only)

In **development** (`npm start`) a **“FR types (debug)”** control is available. To show the same panel in a production build temporarily, set **`REACT_APP_EXECUTIVE_ACTIONS_DEBUG=true`** and rebuild. It only runs `getDocs` (read) on the public Firestore client — no service account, no writes.

### Scheduled sync

Use **GitHub Actions** (`schedule` cron + optional `workflow_dispatch`) or **Google Cloud Scheduler** invoking the same script/container. See `.github/workflows/sync-us-executive-orders.yml` for a monthly GitHub Actions example.
