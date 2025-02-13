import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(express.json());
app.use(cors());

const TWO_FACTOR_API_KEY = "36b27cbd-e88d-11ef-8b17-0200cd936042"; // Your new 2Factor API Key

// Send OTP
app.post("/send-otp", async (req, res) => {
    const { phone } = req.body;
    if (!phone || phone.length !== 10) {
        return res.status(400).json({ success: false, message: "Invalid phone number" });
    }

    try {
        const response = await fetch(`https://2factor.in/API/V1/${TWO_FACTOR_API_KEY}/SMS/${phone}/AUTOGEN`, {
            method: "GET"
        });

        const data = await response.json();
        if (data.Status === "Success") {
            res.json({ success: true, sessionId: data.Details });
        } else {
            res.status(400).json({ success: false, message: data.Details });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
});

// Verify OTP
app.post("/verify-otp", async (req, res) => {
    const { sessionId, otp } = req.body;
    if (!sessionId || !otp) {
        return res.status(400).json({ success: false, message: "Session ID and OTP are required" });
    }

    try {
        const response = await fetch(`https://2factor.in/API/V1/${TWO_FACTOR_API_KEY}/SMS/VERIFY/${sessionId}/${otp}`, {
            method: "GET"
        });
        
        const data = await response.json();
        if (data.Status === "Success") {
            res.json({ success: true, message: "OTP verified successfully" });
        } else {
            res.status(400).json({ success: false, message: "Invalid OTP" });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
});

app.listen(3000, () => console.log("Server running on port 3000"));
