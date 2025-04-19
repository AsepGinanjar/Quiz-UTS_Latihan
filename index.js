const express = require('express');
const AWS = require('aws-sdk');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();

// Konfigurasi AWS
AWS.config.update({
  accessKeyId: 'AKIAXEVXY4VJ7PJLH4VK',
  secretAccessKey: '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',
  region: 'ap-southeast-1'
});

const s3 = new AWS.S3();
const upload = multer({ dest: 'uploads/' });

app.use(express.static(path.join(__dirname, 'views')));

// Upload route
app.post('/upload', upload.single('file'), (req, res) => {
  const fileContent = fs.readFileSync(req.file.path);
  const params = {
    Bucket: 'aspbucket-1',
    Key: req.file.originalname,
    Body: fileContent
  };

  s3.upload(params, function (err, data) {
    fs.unlinkSync(req.file.path);
    if (err) {
      return res.status(500).send("Error saat mengunggah file");
    }
    res.redirect('/');
  });
});

// Route untuk list file dari bucket
app.get('/list-files', async (req, res) => {
  const params = {
    Bucket: 'aspbucket-1'
  };

  try {
    const data = await s3.listObjectsV2(params).promise();
    const files = data.Contents.map(obj => obj.Key);
    res.json(files);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal mengambil daftar file' });
  }
});

app.listen(3000, () => {
  console.log('Server berjalan di http://localhost:3000');
});
