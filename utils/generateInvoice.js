const ejs = require("ejs");
const path = require("path");
const htmlToPdf = require("html-pdf-node");
const cloudinary = require("../cloudConfig").cloudinary;

module.exports = async ({ order, cotation, farmer, company }) => {

  const html = await ejs.renderFile(
    path.join(__dirname, "../views/invoice/invoice.ejs"),
    { order, cotation, farmer, company }
  );

  const options = { format: "A4" };
  const file = { content: html };

  const pdfBuffer = await htmlToPdf.generatePdf(file, options);

  // Upload to Cloudinary
  const result = await new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",  // PDF sathi important
        folder: "invoices",
        public_id: "invoice-" + order._id
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    ).end(pdfBuffer);
  });

  return result.secure_url; // Cloudinary URL return hoil
};
