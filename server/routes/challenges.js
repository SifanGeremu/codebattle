import express from "express";
import { db } from "../database/init.js";
import { authenticateUser } from "../middleware/auth.js";
import { executeCode } from "../services/codeExecution.js";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

// Get all challenges
router.get("/", authenticateUser, (req, res) => {
  try {
    const challenges = db
      .prepare(
        `
      SELECT id, title, description, difficulty, category, initial_code, points, time_limit, created_at, test_cases
      FROM challenges
      ORDER BY difficulty, title
    `
      )
      .all();

    // Parse test cases
    const challengesWithTestCases = challenges.map((challenge) => ({
      ...challenge,
      testCases: JSON.parse(challenge.test_cases),
    }));

    res.json(challengesWithTestCases);
  } catch (error) {
    console.error("Get challenges error:", error);
    res.status(500).json({ message: "Failed to fetch challenges" });
  }
});

// Get challenge by ID
router.get("/:id", authenticateUser, (req, res) => {
  try {
    const challenge = db
      .prepare(
        `
      SELECT id, title, description, difficulty, category, initial_code, points, time_limit, created_at, test_cases
      FROM challenges WHERE id = ?
    `
      )
      .get(req.params.id);

    if (!challenge) {
      return res.status(404).json({ message: "Challenge not found" });
    }

    challenge.testCases = JSON.parse(challenge.test_cases);
    res.json(challenge);
  } catch (error) {
    console.error("Get challenge error:", error);
    res.status(500).json({ message: "Failed to fetch challenge" });
  }
});

// Run code (test without submitting)
router.post("/run", authenticateUser, async (req, res) => {
  try {
    const { challengeId, code } = req.body;

    const challenge = db
      .prepare("SELECT * FROM challenges WHERE id = ?")
      .get(challengeId);
    if (!challenge) {
      return res.status(404).json({ message: "Challenge not found" });
    }

    const testCases = JSON.parse(challenge.test_cases);
    const results = await executeCode(code, testCases);

    res.json({
      output: results.output,
      testResults: results.testResults,
    });
  } catch (error) {
    console.error("Run code error:", error);
    res.status(500).json({
      error: "Code execution failed",
      message: error.message,
    });
  }
});

// Submit solution
router.post("/submit", authenticateUser, async (req, res) => {
  try {
    const { challengeId, code } = req.body;

    const challenge = db
      .prepare("SELECT * FROM challenges WHERE id = ?")
      .get(challengeId);
    if (!challenge) {
      return res.status(404).json({ message: "Challenge not found" });
    }

    const testCases = JSON.parse(challenge.test_cases);
    const results = await executeCode(code, testCases);

    const passedTests = results.testResults.filter((r) => r.passed).length;
    const totalTests = results.testResults.length;
    const success = passedTests === totalTests;

    // Save submission
    const submissionId = uuidv4();
    db.prepare(
      `
      INSERT INTO submissions (id, user_id, challenge_id, code, passed_tests, total_tests, execution_time)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `
    ).run(
      submissionId,
      req.userId,
      challengeId,
      code,
      passedTests,
      totalTests,
      results.executionTime
    );

    // Update user rating if successful
    if (success) {
      const pointsToAdd = Math.floor(
        challenge.points * (passedTests / totalTests)
      );
      db.prepare("UPDATE users SET rating = rating + ? WHERE id = ?").run(
        pointsToAdd,
        req.userId
      );
    }

    res.json({
      success,
      testResults: results.testResults,
      passedTests,
      totalTests,
      points: success ? challenge.points : 0,
    });
  } catch (error) {
    console.error("Submit solution error:", error);
    res.status(500).json({
      error: "Submission failed",
      message: error.message,
    });
  }
});

export default router;
