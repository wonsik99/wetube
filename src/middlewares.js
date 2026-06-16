import multer from "multer";
import { S3Client } from "@aws-sdk/client-s3";
import multerS3 from "multer-s3";

const s3 = new S3Client({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});

const s3AvatarStorage = multerS3({
  s3,
  bucket: "wetube-wonsik99",
  acl: "public-read",
  key: (req, file, cb) => cb(null, `avatars/${Date.now()}_${file.originalname}`),
});
const s3VideoStorage = multerS3({
  s3,
  bucket: "wetube-wonsik99",
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

export const avatarUpload = multer({
  storage: s3AvatarStorage,
  limits: { fileSize: 5000000 },
}); // 5MB
export const videoUpload = multer({
  storage: s3VideoStorage,
  limits: { fileSize: 20000000 },
}); // 20MB
