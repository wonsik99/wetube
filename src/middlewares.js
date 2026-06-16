import multer from "multer";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import multerS3 from "multer-s3";

const S3_BUCKET = process.env.AWS_S3_BUCKET;

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});

// Deletes a single object from S3 by its stored key. No-op for falsy keys.
export const removeFile = async (key) => {
  if (!key) return;
  await s3.send(
    new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: key }),
  );
};

const s3AvatarStorage = multerS3({
  s3,
  bucket: S3_BUCKET,
  acl: "public-read",
  key: (req, file, cb) => cb(null, `avatars/${Date.now()}_${file.originalname}`),
});
const s3VideoStorage = multerS3({
  s3,
  bucket: S3_BUCKET,
  acl: "public-read",
  key: (req, file, cb) => cb(null, `videos/${Date.now()}_${file.originalname}`),
});

//localsMiddleware is a middleware that adds the loggedIn and
//user variables to the response locals
export const localsMiddleware = (req, res, next) => {
  res.locals.loggedIn = Boolean(req.session.loggedIn);
  res.locals.siteName = "Wetube";
  res.locals.user = req.session.user || {};
  next();
};

export const protectorMiddleware = (req, res, next) => {
  if (req.session.loggedIn) {
    return next();
  } else {
    req.flash("error", "Not authorized");
    return res.redirect("/login");
  }
};

export const publicOnlyMiddleware = (req, res, next) => {
  if (!req.session.loggedIn) {
    return next();
  } else {
    req.flash("error", "Not authorized");
    return res.redirect("/");
  }
};

const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

export const avatarUpload = multer({
  storage: s3AvatarStorage,
  limits: { fileSize: MAX_AVATAR_SIZE },
});
export const videoUpload = multer({
  storage: s3VideoStorage,
  limits: { fileSize: MAX_VIDEO_SIZE },
});

// Runs the video/thumbnail upload and turns Multer errors (e.g. file too
// large) into a friendly message instead of a 500.
export const uploadVideoFiles = (req, res, next) => {
  const upload = videoUpload.fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]);
  upload(req, res, (err) => {
    if (err) {
      const errorMessage =
        err.code === "LIMIT_FILE_SIZE"
          ? "File is too large. Maximum upload size is 50MB."
          : "Upload failed. Please try again.";
      return res.status(400).render("upload", {
        pageTitle: "Upload Video",
        errorMessage,
      });
    }
    next();
  });
};
