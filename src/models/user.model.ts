import mongoose, { Schema, InferSchemaType, Model } from "mongoose";

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
      index: true,
    },
  },
  { timestamps: true }
);

export type UserDoc = InferSchemaType<typeof UserSchema> & {
  _id: mongoose.Types.ObjectId;
};
export type UserRole = UserDoc["role"];

export const UserModel: Model<UserDoc> =
  mongoose.models.User || mongoose.model<UserDoc>("User", UserSchema);
