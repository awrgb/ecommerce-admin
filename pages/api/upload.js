import multiparty from 'multiparty';
import {PutObjectCommand, S3Client} from '@aws-sdk/client-s3';
import fs from 'fs';
import mime from 'mime-types';
import {mongooseConnect} from "@/lib/mongoose";
import {isAdminRequest} from "@/pages/api/auth/[...nextauth]";
const bucketName = 'dawid-next-ecommerce';


// pages/api/upload.js

// export default async function handler(req, res) {
//   if (req.method !== 'POST') {
//     return res.status(405).end(); // Method Not Allowed
//   }

//   try {
//     const files = req.files; // Files uploaded via multipart form-data
//     // Process the uploaded files, save them to a storage location, etc.
//     // Example: Save the files to a temporary directory
//     const fileUrls = files.map((file) => {
//       // Save the file to a storage location (e.g., AWS S3, local filesystem)
//       // Return the URL/path of the saved file
//       return `/uploads/${file.name}`; // Example URL
//     });

//     res.status(200).json({ links: fileUrls });
//   } catch (error) {
//     console.error('Error uploading files:', error);
//     res.status(500).json({ message: 'Internal Server Error' });
//   }
// }


export default async function handle(req,res) {
  await mongooseConnect();
  await isAdminRequest(req,res);

  const form = new multiparty.Form();
  const {fields,files} = await new Promise((resolve,reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      resolve({fields,files});
    });
  });
  console.log('length:', files.file.length);
  const client = new S3Client({
    region: 'us-east-1',
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    },
  });
  const links = [];
  for (const file of files.file) {
    const ext = file.originalFilename.split('.').pop();
    const newFilename = Date.now() + '.' + ext;
    await client.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: newFilename,
      Body: fs.readFileSync(file.path),
      ACL: 'public-read',
      ContentType: mime.lookup(file.path),
    }));
    const link = `https://${bucketName}.s3.amazonaws.com/${newFilename}`;
    links.push(link);
  }
  return res.json({links});
}

export const config = {
  api: {bodyParser: false},


  
};