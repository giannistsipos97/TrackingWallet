import { Router } from "express";
import { createAccount, getAccounts } from "../controllers/accountController";
import { authMiddleware } from "../middleware/auth"; // Ensure this path is correct
import { Account } from "../models/Account";
import { Transaction } from "../models/Transaction";
import mongoose from "mongoose";
import { isNonNegativeNumber, isValidObjectId } from "../utils/validation";

const router = Router();

//POST /api/accounts
router.post("/", authMiddleware, createAccount);

//GET /api/accounts
router.get("/", authMiddleware, getAccounts);

//GET /api/accounts/:id
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid account id" });
    }

    if (!userId) {
      return res.status(401).json({ message: "User not identified" });
    }

    // 1. Fetch the account info
    const account = await Account.findOne({ _id: id, userId });
    if (!account) return res.status(404).json({ message: "Account not found" });

    // 2. Fetch the actual transactions
    const transactions = await Transaction.find({ accountId: id, userId })
      .populate("category") // Ensure categories are visible
      .sort({ date: -1 })
      .limit(5);

    const totals = await Transaction.aggregate([
      {
        $match: {
          accountId: new mongoose.Types.ObjectId(id),
          userId: new mongoose.Types.ObjectId(userId),
        },
      },
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
router.put("/updateBalance/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    const accountId = req.params.id;

    if (!userId) {
      return res.status(401).json({ message: "User not identified" });
    }

    if (!isValidObjectId(accountId)) {
      return res.status(400).json({ message: "Invalid account id" });
    }

    if (!isNonNegativeNumber(req.body.balance)) {
      return res.status(400).json({ message: "Balance must be a non-negative number" });
    }

    const updatedAccount = await Account.findOneAndUpdate(
      { _id: accountId, userId },
      { balance: req.body.balance },
      { new: true }, // Returns the updated document instead of the old one
    );

    if (!updatedAccount) return res.status(404).json({ message: "Account not found" });

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

    if (!isValidObjectId(accountId)) {
      return res.status(400).json({ message: "Invalid account id" });
    }

    const account = await Account.findOne({ _id: accountId, userId });
    if (!account) return res.status(404).json({ message: "Account not found" });

    await Transaction.deleteMany({ accountId, userId });

    await Account.deleteOne({ _id: accountId, userId });

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
