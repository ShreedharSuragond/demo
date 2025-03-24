const express = require("express");
const nodemailer = require("nodemailer");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" })); // Allow large image uploads

app.post("/send-email", async (req, res) => {
    const { image, location } = req.body;

    if (!image) {
        return res.status(400).json({ error: "No image provided" });
    }

    const imagePath = "image.jpg";

    try {
        // Convert Base64 to image file
        console.log("🔹 Saving image...");
        const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
        fs.writeFileSync(imagePath, base64Data, "base64");
        console.log("✅ Image saved successfully:", imagePath);

        // Email configuration
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "shreedharsuragonds@gmail.com",
                pass: "ecep nvkv aluw qgjc",
            },
        });

        const mailOptions = {
            from: "shreedharsuragonds@gmail.com",
            to: "shreedharkumarsuragond@gmail.com",
            subject: "Live Image & Location",
            text: `Captured Image & Location:\n\n ${await getCityName(location.latitude, location.longitude)}`,
            attachments: [{ filename: "image.jpg", path: imagePath }]
        };

        await transporter.sendMail(mailOptions);
        console.log("📧 Email sent successfully!");

        // Check if file exists before deleting
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
            console.log("🗑️ Image deleted after sending email");
        }

        res.json({ message: "Email sent successfully!" });
    } catch (error) {
        console.error("❌ Error sending email:", error);
        res.status(500).json({ error: "Failed to send email" });
    }

});

async function getCityName(latitude, longitude) {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
        );
        const data = await response.json();
        return data.address.village || data.address.town || data.address.city || "City not found";
    } catch (error) {
        console.error("❌ Error fetching city:", error);
        return "Location not available";
    }
}

app.listen(3000, () => console.log("✅ Server running on http://localhost:3000"));
