# Wetube

> A full-stack YouTube-style video platform built with Node.js, Express, and MongoDB — featuring GitHub OAuth, AWS S3 media storage, a custom HTML5 video player, and in-browser recording with FFmpeg (WASM).

![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white)
![AWS S3](https://img.shields.io/badge/AWS%20S3-569A31?logo=amazons3&logoColor=white)
![Pug](https://img.shields.io/badge/Pug-A86454?logo=pug&logoColor=white)
![Webpack](https://img.shields.io/badge/Webpack-8DD6F9?logo=webpack&logoColor=black)

## Overview

Wetube is a server-rendered video sharing application where users can sign up (or log in with GitHub), upload and manage videos, watch them through a custom player, record short clips directly in the browser, and interact through comments and likes. Uploaded media (videos, thumbnails, avatars) is stored on AWS S3 rather than the local disk, making the app deployment-ready.

## Engineering Highlights

- **Cloud media storage on AWS S3** — uploads stream directly to S3 via `multer-s3`. The S3 object key is persisted alongside the URL in MongoDB, so deletions reliably clean up the corresponding objects (no orphaned files).
- **Cascading deletes** — removing a video deletes its S3 video + thumbnail objects, its comments, and its reference in the owner's document, all behind an ownership authorization check.
- **Dual authentication** — session-based auth with hashed passwords (`bcrypt`) plus GitHub OAuth, with sessions persisted in MongoDB (`connect-mongo`).
- **Custom video player** — built from scratch on the HTML5 media API (play/pause, mute, volume, timeline seeking, fullscreen, view counting).
- **In-browser recording** — captures webcam via the MediaRecorder API and transcodes to MP4 with FFmpeg compiled to WebAssembly, entirely client-side.
- **Separated build pipeline** — server transpiled with Babel; client JS/SCSS bundled with Webpack.

## Features

- User registration, login, and logout
- GitHub OAuth login
- Profile editing, avatar uploads, and password changes
- Video upload, edit, delete, and search
- Custom video player
  - Play and pause
  - Mute and volume control
  - Timeline seeking
  - Fullscreen mode
  - View count increment after playback ends
- Browser camera recording
  - 5-second recording
  - MP4 transcoding with FFmpeg WASM
  - Thumbnail generation and downloads
- Comment creation, deletion, likes, and unlikes
- AWS S3 storage for videos, thumbnails, and avatars (with cleanup on delete)
- MongoDB-backed session storage
- Pug templates and SCSS styling

## Tech Stack

- **Runtime:** Node.js
- **Server:** Express
- **Database:** MongoDB, Mongoose
- **Storage:** AWS S3 (`@aws-sdk/client-s3`, `multer-s3`)
- **View:** Pug
- **Styling:** SCSS
- **Build:** Babel, Webpack
- **Auth:** express-session, connect-mongo, bcrypt, GitHub OAuth
- **Uploads:** Multer
- **Media:** MediaRecorder API, FFmpeg WASM

## Project Structure

```text
src/
  client/js/          Browser-side scripts (player, recorder, comments)
  controllers/        Route handlers
  models/             Mongoose models
  routers/            Express routers
  scss/               SCSS styles
  views/              Pug templates
  db.js               MongoDB connection
  init.js             App entry point
  middlewares.js      Shared middleware + S3 client/helpers
  server.js           Express app setup
assets/               Webpack build output
dist/                 Server build output
```

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the project root and set the following values.

```bash
COOKIE_SECRET=your_cookie_secret
DB_URL=mongodb://127.0.0.1:27017/wetube
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
AWS_ACCESS_KEY=your_aws_access_key
AWS_SECRET_KEY=your_aws_secret_key
AWS_REGION=your_bucket_region          # e.g. us-east-2
AWS_S3_BUCKET=your_bucket_name
```

To use GitHub OAuth, set your GitHub OAuth App callback URL to:

```text
http://localhost:4000/users/github/finish
```

### 3. Prepare External Services

- **MongoDB** — make sure it is running (locally or via MongoDB Atlas) at the address in `DB_URL`. For Atlas, whitelist your IP under Network Access.
- **AWS S3** — create a bucket and an IAM user with access to it. The app uploads objects with `public-read` ACL, so the bucket must allow ACLs (Object Ownership) or be fronted by an equivalent public-read policy.

### 4. Run the Development Server

Run the server and frontend asset watcher in separate terminal sessions.

```bash
npm run dev:server
```

```bash
npm run dev:assets
```

The app runs at:

```text
http://localhost:4000
```

## npm Scripts

| Command | Description |
| --- | --- |
| `npm run dev:server` | Run the development server with Nodemon and Babel |
| `npm run dev:assets` | Run Webpack in development watch mode |
| `npm run build:server` | Build server code from `src` into `dist` |
| `npm run build:assets` | Build production frontend assets with Webpack |
| `npm run build` | Build both server code and frontend assets |
| `npm start` | Run the built server from `dist/init.js` |

## Main Routes

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/` | Home page with the latest videos |
| `GET`, `POST` | `/join` | User registration |
| `GET`, `POST` | `/login` | User login |
| `GET` | `/search` | Video search |
| `GET` | `/users/logout` | User logout |
| `GET`, `POST` | `/users/edit` | Edit profile (avatar upload to S3) |
| `GET`, `POST` | `/users/change-password` | Change password |
| `GET` | `/users/github/start` | Start GitHub login |
| `GET` | `/users/github/finish` | GitHub login callback |
| `GET` | `/users/:id` | User profile |
| `GET`, `POST` | `/videos/upload` | Upload video |
| `GET` | `/videos/:id` | Watch video |
| `GET`, `POST` | `/videos/:id/edit` | Edit video |
| `GET` | `/videos/:id/delete` | Delete video (removes S3 objects + comments) |
| `POST` | `/api/videos/:id/views` | Increment video views |
| `POST` | `/api/videos/:id/comment` | Create comment |
| `DELETE` | `/api/comments/:id` | Delete comment |
| `POST` | `/api/comments/:id/like` | Like comment |
| `DELETE` | `/api/comments/:id/like` | Unlike comment |

## Build and Run (Production)

```bash
npm run build
npm start
```

The server listens on `process.env.PORT` (falling back to `4000`), so it can be deployed to platforms such as Render or Railway. Set all environment variables above on the host.

## Notes

- `assets/` contains files generated by Webpack and is excluded from Git.
- User-uploaded media (videos, thumbnails, avatars) is stored on AWS S3, not on the local disk.
- `.env`, `assets/`, and `node_modules/` are excluded from Git.
