
import mongoose, {
  Schema,
  Document,
  Types,
} from "mongoose";

export interface IFavorite extends Document {
  userId: Types.ObjectId;
  restaurantId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const favoriteSchema = new Schema<IFavorite>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

favoriteSchema.index(
  { userId: 1, restaurantId: 1 },
  { unique: true }
);

const Favorite =
  mongoose.models.Favorite ||
  mongoose.model<IFavorite>(
    "Favorite",
    favoriteSchema
  );

export default Favorite;
