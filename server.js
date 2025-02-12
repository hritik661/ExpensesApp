import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(express.json());
app.use(cors());

const TWOFACTOR_API_KEY = "36b27cbd-e88d-11ef-8b17-0200cd936042";  // Replace with your actual 2Factor API Key

// ✅ Send OTP
app.post("/send-otp", async (req, res) => {
    const { phone } = req.body;

    if (!phone) {
        return res.status(400).json({ error: "Phone number is required" });
    }

    try {
        const response = await fetch(`https://2factor.in/API/V1/${TWOFACTOR_API_KEY}/SMS/+91${phone}/AUTOGEN`, {
            method: "GET"
        });

        const data = await response.json();
        console.log("📩 2Factor API Response:", data);

        if (data.Status !== "Success") {
            return res.status(500).json({ error: "Failed to send OTP", details: data });
        }

        res.json({ success: true, message: "OTP sent successfully", sessionId: data.Details });
    } catch (error) {
        console.error("❌ 2Factor Error:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});

// ✅ Verify OTP
app.post("/verify-otp", async (req, res) => {
    const { sessionId, otp } = req.body;

    if (!sessionId || !otp) {
        return res.status(400).json({ error: "Session ID and OTP are required" });
    }

    try {
        const response = await fetch(`https://2factor.in/API/V1/${TWOFACTOR_API_KEY}/SMS/VERIFY/${sessionId}/${otp}`, {
            method: "GET"
        });

        const data = await response.json();
        console.log("✅ 2Factor Verification Response:", data);

        if (data.Status === "Success") {
            res.json({ success: true, message: "OTP Verified!" });
        } else {
            res.status(400).json({ error: "Invalid OTP" });
        }
    } catch (error) {
        console.error("❌ 2Factor Verification Error:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});

app.listen(3000, () => console.log("✅ Server running on port 3000"));
