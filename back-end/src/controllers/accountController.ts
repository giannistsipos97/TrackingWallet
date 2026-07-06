import { Request, Response } from "express";
import { Account } from "../models/Account";
import { isNonEmptyString, isNonNegativeNumber } from "../utils/validation";

export const createAccount = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const { name, balance, color } = req.body;
    const startingBalance = balance ?? 0;

    if (!isNonEmptyString(name)) {
      return res.status(400).json({ message: "Account name is required" });
    }

    if (!isNonNegativeNumber(startingBalance)) {
      return res.status(400).json({ message: "Balance must be a non-negative number" });
    }

    if (color !== undefined && !isNonEmptyString(color)) {
      return res.status(400).json({ message: "Color must be a non-empty string" });
    }

    const account = new Account({
      userId: req.user.id,
      name: name.trim(),
      balance: startingBalance,
      color,
    });

    await account.save();
    res.status(201).json(account);
  } catch (error: any) {
    res.status(500).json({
      message: "Server error creating account",
      error: error.message, // This sends the reason back to Postman!
    });
  }
};

export const getAccounts = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Only find accounts belonging to THIS user
    const accounts = await Account.find({ userId: req.user.id });
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching accounts" });
  }
};
