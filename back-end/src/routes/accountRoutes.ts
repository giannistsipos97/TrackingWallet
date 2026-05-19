import { Router } from "express";
import { createAccount, getAccounts } from "../controllers/accountController";
import { authMiddleware } from "../middleware/auth"; // Ensure this path is correct
import { Account } from "../models/Account";
import { Transaction } from "../models/Transaction";
import mongoose from "mongoose";

const router = Router();

//POST /api/accounts
router.post("/", authMiddleware, createAccount);

//GET /api/accounts
router.get("/", authMiddleware, getAccounts);

//GET /api/accounts/:id
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Fetch the account info
    const account = await Account.findById(id);
    if (!account) return res.status(404).json({ message: "Account not found" });

    // 2. Fetch the actual transactions
    const transactions = await Transaction.find({ accountId: id })
      .populate("category") // Ensure categories are visible
      .sort({ date: -1 })
      .limit(5);

    const totals = await Transaction.aggregate([
      { $match: { accountId: new mongoose.Types.ObjectId(id) } },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
        },
      },
    ]);

    const summary = {
      income: totals.find((t) => t._id === "income")?.total || 0,
      expenses: totals.find((t) => t._id === "expense")?.total || 0,
    };

    res.json({ account, transactions, summary });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/accounts/updateBalance/:id
router.put("/updateBalance/:id", async (req, res) => {
  try {
    const updatedAccount = await Account.findByIdAndUpdate(
      req.params.id,
      { balance: req.body.balance },
      { new: true }, // Returns the updated document instead of the old one
    );
    res.json(updatedAccount);
  } catch (err) {
    res.status(500).json({ message: "Database update failed" });
  }
});

// DELETE /api/accounts/:id
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const accountId = req.params.id;

    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "User not identified" });
    }
    await Transaction.deleteMany({ accountId: accountId });

    await Account.findByIdAndDelete(accountId);

    res.json({ message: "Account and all associated transactions deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting account:", error);
    // Temporary change for debugging:
    res.status(500).json({
      message: "Server error during deletion",
      error: error.message,
    });
  }
});

export default router;
