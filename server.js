const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const multer = require("multer");
const { BlobServiceClient } = require("@azure/storage-blob");
const {
  BlobSASPermissions,
  generateBlobSASQueryParameters,
  StorageSharedKeyCredential
} = require("@azure/storage-blob");

const app = express();

app.use(cors());
app.use(express.json());


require("dotenv").config();

const accountName = "srristorage123";

const connectionString =
  process.env.AZURE_STORAGE_CONNECTION_STRING;

const blobServiceClient =
  BlobServiceClient.fromConnectionString(
    connectionString
  );

app.get("/", (req, res) => {
  res.send("Backend Running");
});

app.get("/submissions", async (req, res) => {

  try {

    const result = await pool.query(
      "SELECT * FROM submissions ORDER BY id DESC"
    );

    res.json(result.rows);

  } catch (err) {

    console.log(err);

    res.status(500).json({
      error: err.message
    });

  }

});

app.post(
  "/submit",
  upload.single("file"),
  async (req, res) => {
    try {
      const { name, email } = req.body;

      const containerClient =
        blobServiceClient.getContainerClient(
          "uploads"
        );

      const fileName =
        Date.now() +
        "-" +
        req.file.originalname;

      const blockBlobClient =
        containerClient.getBlockBlobClient(
          fileName
        );

     await blockBlobClient.uploadData(
  req.file.buffer,
  {
    blobHTTPHeaders: {
      blobContentType: "application/pdf",
      blobContentDisposition: "inline"
    }
  }
);
      const blobName = fileName;

await pool.query(
  `INSERT INTO submissions
  (name,email,resume_url)
  VALUES($1,$2,$3)`,
  [name,email,blobName]
);

      res.json({
        success: true,
        resume_url: blobName
      });

    } catch (err) {

      console.error(err);

      res.status(500).json({
        error: err.message
      });

    }
  }
);

app.get("/resume/:blobName", async (req,res)=>{

  try{

    const blobName =
      req.params.blobName;

    const expiresOn =
      new Date(
        Date.now() + 10000
      );

    const sasToken =
      generateBlobSASQueryParameters(
        {
          containerName:"uploads",
          blobName,
          permissions:
            BlobSASPermissions.parse("r"),
          expiresOn
        },
        sharedKeyCredential
      ).toString();

    const url =
      `https://${accountName}.blob.core.windows.net/uploads/${blobName}?${sasToken}`;
	console.log(url);
    res.json({ url });

  }catch(err){

    console.log(err);

    res.status(500).json({
      error:err.message
    });

  }

});

app.listen(3000, () => {
  console.log(
    "Server running on port 3000"
  );
});
