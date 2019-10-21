// Use local .env file for env vars when not deployed
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const aws = require('aws-sdk')
const multer = require('multer')
const multerS3 = require('multer-s3')
const crypto = require("crypto");

const s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: "us-east-1",
});

// Initialize multers3 with our s3 config and other options
const upload = multer({
  storage: multerS3({
    s3,
    bucket: process.env.AWS_BUCKET,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: 'public-read',
    metadata(req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key(req, file, cb) {
      crypto.randomBytes(16, (err, hash) => {
        if (err) cb(err);

        const fileName = `${hash.toString("hex")}-${file.originalname}`;

        cb(null, fileName);
      });
    }
  })
})

// Expose the /upload endpoint
const app = require('express')();
const http = require('http').Server(app);

app.post('/upload', upload.single('photo'), (req, res, next) => {
  res.json(req.file)
})

app.get("/", (req, res) => {
  res.send("SUCCESS")
})

let port = process.env.PORT || 3000;
http.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
