import * as mongoose from "mongoose";
const Schema = mongoose.Schema;

export interface UserGatewayCredentialsInterface {
  username: string;
  email: string;
  id: string;
  secret: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const UserGatewayCredentialsSchema = new Schema(
  {
    isActive: {
      type: Boolean,
      required: false,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
    },
    id: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      match: /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/,
      required: true,
      trim: true,
    },
    secret: {
      type: String,
      required: false,
      trim: true,
    },
    updatedAt: {
      type: String,
      required: true,
      trim: true,
    },
    createdAt: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    useNestedStrict: true,
  }
);

export default mongoose.model(
  "UserGatewayCredentials",
  UserGatewayCredentialsSchema
);
