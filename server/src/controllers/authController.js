const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const pool = require("../config/database");
const { alreadyInDatabase } = require("../utils/authUtils");
const nodemailer = require("nodemailer");

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Helper function to send verification email
async function sendVerificationEmail(userEmail, token) {
  const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  try {
    const info = await transporter.sendMail({
      from: `"${process.env.APP_NAME}" <${process.env.EMAIL_FROM}>`,
      to: userEmail,
      subject: "Verify Your Email Address",
      text: `Please verify your email by clicking on this link: ${verificationLink}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #333;">Email Verification</h2>
          <p>Thank you for signing up! Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 25px 0;">
            <a href="${verificationLink}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email</a>
          </div>
          <p>If the button doesn't work, you can also click on this link: <a href="${verificationLink}">${verificationLink}</a></p>
          <p>This link will expire in 24 hours.</p>
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
          <p style="color: #777; font-size: 12px;">If you didn't sign up for this account, you can safely ignore this email.</p>
        </div>
      `,
    });

    console.log("Verification email sent: %s", info.messageId, userEmail, info.response);
    return true;
  } catch (error) {
    console.error("Error sending verification email:", error);
    return false;
  }
}

// Helper function to send password reset email
async function sendPasswordResetEmail(userEmail, token) {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  try {
    const info = await transporter.sendMail({
      from: `"${process.env.APP_NAME}" <${process.env.EMAIL_FROM}>`,
      to: userEmail,
      subject: "Reset Your Password",
      text: `Reset your password by clicking on this link: ${resetLink}. This link will expire in 1 hour.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #333;">Password Reset</h2>
          <p>You requested to reset your password. Click the button below to set a new password:</p>
          <div style="text-align: center; margin: 25px 0;">
            <a href="${resetLink}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
          </div>
          <p>If the button doesn't work, you can also click on this link: <a href="${resetLink}">${resetLink}</a></p>
          <p>This link will expire in 1 hour. If you didn't request this reset, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
          <p style="color: #777; font-size: 12px;">If you didn't request a password reset, you can safely ignore this email.</p>
        </div>
      `,
    });

    console.log("Password reset email sent: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return false;
  }
}

exports.signIn = async (req, res) => {
  const client = await pool.connect();

  try {
    const { email, password } = req.body;

    const userQuery = `
      SELECT * 
      FROM "User"
      WHERE email = $1
    `;

    const userResult = await client.query(userQuery, [email]);

    if (userResult.rowCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = userResult.rows[0];
    console.log(user);

    // Check if user is verified
    if (false && user.is_verified === false) {
      // Generate new verification token
      const verificationToken = jwt.sign({ email, purpose: "email_verification" }, process.env.JWT_SECRET, { expiresIn: "24h" });

      // Update user's verification token
      const updateTokenQuery = `
        UPDATE "User"
        SET verification_token = $1, updated_at = NOW()
        WHERE email = $2
      `;

      await client.query(updateTokenQuery, [verificationToken, email]);

      // Send verification email
      await sendVerificationEmail(email, verificationToken);

      return res.status(401).json({
        message: "Please verify your email before logging in. A new verification link has been sent to your email.",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    const payload = {
      username: user.username,
      date: new Date(),
    };

    const jwtExpire = 60 * 60 * 2; // 2 hours
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: jwtExpire });

    // Format user data for response (convert snake_case to camelCase)
    const formattedUser = {
      username: user.username,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
      profile_complete: user.profile_complete,
      sexual_preferences: user.sexual_preferences,
      gender: user.gender,
      birth_date: user.birth_date,
      biography: user.biography,
      profile_picture: user.profile_picture,
      created_at: user.created_at,
      updated_at: user.updated_at,
      interests: user.interests,
      authorize_location: user.authorize_location,
      pictures: user.pictures,
    };

    return res.status(200).json({ token, user: formattedUser });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: "Internal server error" });
  } finally {
    client.release();
  }
};

exports.signUp = async (req, res) => {
  const client = await pool.connect();

  try {
    const { email, password, firstname, lastname, username, birth_date } = req.body;
    if (await alreadyInDatabase(email, username)) {
      return res.status(409).json({ message: "Email or username already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate verification token
    const verificationToken = jwt.sign({ email, purpose: "email_verification" }, process.env.JWT_SECRET, { expiresIn: "24h" });

    // Start transaction
    await client.query("BEGIN");

    const createUserQuery = `
      INSERT INTO "User" (
        email, 
        password, 
        firstname, 
        lastname, 
        username, 
        birth_date,
        sexual_preferences,
        interests,
        pictures,
        is_verified,
        verification_token,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
      RETURNING username
    `;

    await client.query(createUserQuery, [
      email,
      hashedPassword,
      firstname,
      lastname,
      username,
      new Date(birth_date),
      [], // Empty sexual_preferences array
      [], // Empty interests array
      [], // Empty pictures array
      false, // Not verified yet
      verificationToken,
    ]);

    // Send verification email
    const emailSent = true || await sendVerificationEmail(email, verificationToken);

    // Commit transaction
    await client.query("COMMIT");

    if (emailSent) {
      return res.status(201).json({
        message: "User created successfully. Please check your email to verify your account.",
      });
    } else {
      return res.status(201).json({
        message: "User created successfully, but we could not send the verification email. Please contact support.",
      });
    }
  } catch (e) {
    // Rollback in case of error
    await client.query("ROLLBACK");
    console.log(e);
    return res.status(500).json({ message: "Internal server error" });
  } finally {
    client.release();
  }
};

exports.verifyEmail = async (req, res) => {
  const client = await pool.connect();

  try {
    const { token } = req.body;

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded);

    if (decoded.purpose !== "email_verification") {
      return res.status(400).json({ message: "Invalid token purpose" });
    }

    // Start transaction
    await client.query("BEGIN");

    // Find user by email and token
    const userQuery = `
      SELECT * FROM "User"
      WHERE email = $1 AND verification_token = $2 AND is_verified = false
    `;

    const userResult = await client.query(userQuery, [decoded.email, token]);
    console.log(userResult);
    if (userResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        message: "Invalid or expired verification link. The account may already be verified.",
      });
    }

    // Update user verification status
    const updateUserQuery = `
      UPDATE "User"
      SET is_verified = true, verification_token = NULL, updated_at = NOW()
      WHERE email = $1
      RETURNING username, email
    `;

    const updateResult = await client.query(updateUserQuery, [decoded.email]);

    // Commit transaction
    await client.query("COMMIT");

    return res.status(200).json({
      message: "Email verification successful. You can now log in.",
      user: updateResult.rows[0],
    });
  } catch (error) {
    // Rollback in case of error
    await client.query("ROLLBACK");

    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(400).json({ message: "Invalid or expired verification link." });
    }

    console.error("Email verification error:", error);
    return res.status(500).json({ message: "Server error during email verification" });
  } finally {
    client.release();
  }
};

exports.forgotPassword = async (req, res) => {
  const client = await pool.connect();

  try {
    const { email } = req.body;

    // Start transaction
    await client.query("BEGIN");

    // Find user by email
    const userQuery = 'SELECT * FROM "User" WHERE email = $1';
    const userResult = await client.query(userQuery, [email]);

    // Don't reveal if user exists or not for security
    if (userResult.rowCount === 0) {
      await client.query("COMMIT");
      return res.status(200).json({
        message: "If your email is registered, you will receive a password reset link.",
      });
    }

    // Generate reset token (random and secure)
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash token before saving to database
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    // Set token expiration (1 hour from now)
    const expiration = new Date();
    expiration.setHours(expiration.getHours() + 1);

    // Save to user in database
    const updateUserQuery = `
      UPDATE "User"
      SET reset_password_token = $1, reset_password_expires = $2, updated_at = NOW()
      WHERE email = $3
    `;

    await client.query(updateUserQuery, [hashedToken, expiration, email]);

    // Create JWT for the email link
    const resetJwt = jwt.sign(
      {
        email,
        purpose: "password_reset",
        token: resetToken, // Original token included in JWT
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Send password reset email
    const emailSent = await sendPasswordResetEmail(email, resetJwt);

    // Commit transaction
    await client.query("COMMIT");

    return res.status(200).json({
      message: "If your email is registered, you will receive a password reset link.",
    });
  } catch (error) {
    // Rollback in case of error
    await client.query("ROLLBACK");
    console.error("Password reset request error:", error);
    return res.status(500).json({ message: "Server error processing password reset request" });
  } finally {
    client.release();
  }
};

exports.resetPassword = async (req, res) => {
  const client = await pool.connect();

  try {
    const { token, newPassword } = req.body;

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.purpose !== "password_reset") {
      return res.status(400).json({ message: "Invalid token purpose" });
    }

    // Hash the token from JWT
    const hashedToken = crypto.createHash("sha256").update(decoded.token).digest("hex");

    // Start transaction
    await client.query("BEGIN");

    // Find user with token and check if expired
    const userQuery = `
      SELECT * FROM "User"
      WHERE email = $1 AND reset_password_token = $2 AND reset_password_expires > NOW()
    `;

    const userResult = await client.query(userQuery, [decoded.email, hashedToken]);

    if (userResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        message: "Invalid or expired password reset link. Please request a new one.",
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user password and clear reset token fields
    const updateUserQuery = `
      UPDATE "User"
      SET password = $1, reset_password_token = NULL, reset_password_expires = NULL, updated_at = NOW()
      WHERE email = $2
      RETURNING username, email
    `;

    const updateResult = await client.query(updateUserQuery, [hashedPassword, decoded.email]);

    // Commit transaction
    await client.query("COMMIT");

    return res.status(200).json({
      message: "Password has been reset successfully. You can now log in with your new password.",
      user: updateResult.rows[0],
    });
  } catch (error) {
    // Rollback in case of error
    await client.query("ROLLBACK");

    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(400).json({ message: "Invalid or expired reset link." });
    }

    console.error("Password reset error:", error);
    return res.status(500).json({ message: "Server error during password reset" });
  } finally {
    client.release();
  }
};

exports.resendVerification = async (req, res) => {
  const client = await pool.connect();

  try {
    const { email } = req.body;

    // Start transaction
    await client.query("BEGIN");

    // Find user by email and verification status
    const userQuery = `
      SELECT * FROM "User"
      WHERE email = $1 AND is_verified = false
    `;

    const userResult = await client.query(userQuery, [email]);

    if (userResult.rowCount === 0) {
      await client.query("COMMIT");
      return res.status(200).json({
        message: "If your email is registered and not verified, you will receive a verification email.",
      });
    }

    // Generate new verification token
    const verificationToken = jwt.sign({ email, purpose: "email_verification" }, process.env.JWT_SECRET, { expiresIn: "24h" });

    // Update user with new verification token
    const updateUserQuery = `
      UPDATE "User"
      SET verification_token = $1, updated_at = NOW()
      WHERE email = $2
    `;

    await client.query(updateUserQuery, [verificationToken, email]);

    // Send verification email
    const emailSent = await sendVerificationEmail(email, verificationToken);

    // Commit transaction
    await client.query("COMMIT");

    return res.status(200).json({
      message: "If your email is registered and not verified, you will receive a verification email.",
    });
  } catch (error) {
    // Rollback in case of error
    await client.query("ROLLBACK");
    console.error("Resend verification error:", error);
    return res.status(500).json({ message: "Server error during resend verification" });
  } finally {
    client.release();
  }
};
