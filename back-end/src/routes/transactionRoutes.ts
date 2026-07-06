import { Request, Response, Router } from "express";
import { Transaction } from "../models/Transaction";
import { Account } from "../models/Account";
import { authMiddleware } from "../middleware/auth";
import {
  getObjectId,
  isNonEmptyString,
  isPositiveNumber,
  isTransactionType,
  isValidDateInput,
  isValidObjectId,
} from "../utils/validation";

const router = Router();

// GET /api/transactions
router.get("/", authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const accountId = req.query.accountId as string;

    // Base filter object
    const query: any = { userId: req.user.id };

    if (accountId) {
      if (!isValidObjectId(accountId)) {
        return res.status(400).json({ message: "Invalid account id" });
      }

      query.accountId = accountId;
    }

    // Date Range Filtering parameters
    const yearParam = req.query.year as string;
    const monthParam = req.query.month as string;

    if (yearParam && monthParam) {
      const year = parseInt(yearParam);
      const month = parseInt(monthParam);

      if (!Number.isInteger(year) || !Number.isInteger(month) || month < 0 || month > 11) {
        return res.status(400).json({ message: "Invalid year or month" });
      }

      // Boundary match matching full month span range blocks
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 1);

      query.date = {
        $gte: startDate,
        $lt: endDate,
      };
    }

    //Simply fetch all matching transactions sorted by date
    const transactions = await Transaction.find(query).sort({ date: -1 }).populate("category");

    res.json(transactions);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: "Server error while fetching ledger entries." });
  }
});

//POST method for creating a transaction
router.post("/", authMiddleware, async (req: Request, res: Response) => {
  const { accountId, amount, type, description, category, date } = req.body;

  try {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const userId = req.user.id;
    const categoryId = getObjectId(category);

    if (!isValidObjectId(accountId)) {
      return res.status(400).json({ message: "Invalid account id" });
    }

    if (!isPositiveNumber(amount)) {
      return res.status(400).json({ message: "Amount must be a positive number" });
    }

    if (!isTransactionType(type)) {
      return res.status(400).json({ message: "Type must be income or expense" });
    }

    if (!categoryId) {
      return res.status(400).json({ message: "Category is required" });
    }

    if (description !== undefined && !isNonEmptyString(description)) {
      return res.status(400).json({ message: "Description must be a non-empty string" });
    }

    if (!isValidDateInput(date)) {
      return res.status(400).json({ message: "Invalid date" });
    }

    const account = await Account.findOne({ _id: accountId, userId });
    if (!account) return res.status(404).json({ message: "Account not found" });

    // 1. Save Transaction
    let transaction = new Transaction({
      userId,
      accountId,
      amount,
      type,
      description: description?.trim(),
      category: categoryId,
      date,
    });

    await transaction.save();

    // 2. Populate for the frontend
    transaction = await transaction.populate("category");

    // 3. Update Account
    const change = type === "expense" ? -amount : amount;
    const updatedAccount = await Account.findOneAndUpdate(
      { _id: accountId, userId },
      { $inc: { balance: change } },
      { new: true },
    );

    res.status(201).json({ transaction, account: updatedAccount });
  } catch (err: any) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
});

//PUT method for updating a transaction
router.put("/:id", authMiddleware, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { amount, type, description, category, date } = req.body;

  try {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const userId = req.user.id;
    const categoryId = getObjectId(category);

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid transaction id" });
    }

    if (!isPositiveNumber(amount)) {
      return res.status(400).json({ message: "Amount must be a positive number" });
    }

    if (!isTransactionType(type)) {
      return res.status(400).json({ message: "Type must be income or expense" });
    }

    if (!categoryId) {
      return res.status(400).json({ message: "Category is required" });
    }

    if (description !== undefined && !isNonEmptyString(description)) {
      return res.status(400).json({ message: "Description must be a non-empty string" });
    }

    if (!isValidDateInput(date)) {
      return res.status(400).json({ message: "Invalid date" });
    }

    // 1. Find the old transaction first to see the previous balance impact
    const oldTransaction = await Transaction.findOne({ _id: id, userId });
    if (!oldTransaction) return res.status(404).json({ message: "Transaction not found" });

    // 2. Calculate the Balance Adjustment
    const oldImpact = oldTransaction.type === "expense" ? -oldTransaction.amount : oldTransaction.amount;
    const newImpact = type === "expense" ? -amount : amount;
    const balanceAdjustment = newImpact - oldImpact;

    // 3. Update the Transaction
    const updatedTransaction = await Transaction.findByIdAndUpdate(
      id,
      { amount, type, description: description?.trim(), category: categoryId, date },
      { new: true },
    ).populate("category");

    // 4. Update the Account balance if the amount/type changed
    let updatedAccount = null;

    if (balanceAdjustment !== 0) {
      // Line below is where the error likely is
      updatedAccount = await Account.findOneAndUpdate(
        { _id: oldTransaction.accountId, userId },
        { $inc: { balance: balanceAdjustment } },
        { new: true },
      );
    } else {
      // As we discussed, fetch current account if no change
      updatedAccount = await Account.findOne({ _id: oldTransaction.accountId, userId });
    }

    res.json({ transaction: updatedTransaction, account: updatedAccount });
  } catch (err: any) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/transactions/:id
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const userId = req.user.id;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid transaction id" });
    }

    const transaction = await Transaction.findOne({ _id: id, userId });

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    const { accountId, amount, type } = transaction;

    await Transaction.findOneAndDelete({ _id: id, userId });

    const adjustment = type === "expense" ? amount : -amount;

    await Account.findOneAndUpdate(
      { _id: accountId, userId },
      {
        $inc: { balance: adjustment },
      },
    );

    res.json({ message: "Transaction deleted and balance updated" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
