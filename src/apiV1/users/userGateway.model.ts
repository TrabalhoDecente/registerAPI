import * as mongoose from "mongoose";
const Schema = mongoose.Schema;

const UserGatewaySchema = new Schema(
  {
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
    firstname: {
      type: String,
      required: false,
      trim: true,
    },
    lastname: {
      type: String,
      required: false,
      trim: true,
    },

    redirectUri: {
      type: String,
      required: true,
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

export default mongoose.model("UserGateway", UserGatewaySchema);
