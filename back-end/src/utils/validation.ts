import mongoose from "mongoose";

export const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

export const isValidEmail = (value: unknown): value is string =>
  isNonEmptyString(value) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

export const isNonNegativeNumber = (value: unknown): value is number =>
  isFiniteNumber(value) && value >= 0;

export const isPositiveNumber = (value: unknown): value is number =>
  isFiniteNumber(value) && value > 0;

export const isTransactionType = (value: unknown): value is "income" | "expense" =>
  value === "income" || value === "expense";

export const isValidObjectId = (value: unknown): value is string =>
  typeof value === "string" && mongoose.isValidObjectId(value);

export const getObjectId = (value: unknown): string | undefined => {
  if (isValidObjectId(value)) return value;

  if (
    value &&
    typeof value === "object" &&
    "_id" in value &&
    isValidObjectId(value._id)
  ) {
    return value._id;
  }

  return undefined;
};

export const isValidDateInput = (value: unknown): boolean => {
  if (value === undefined || value === null || value === "") return true;
  return typeof value === "string" && !Number.isNaN(new Date(value).getTime());
};
