import {Document, Schema, model} from 'mongoose';

export type ContactNumberTypeProjectionDocumentType = Document & {
  _id: string;
  name: string;
  status: string;
  order: number;
  last_sequence_id: number;
};

const contactNumberType = new Schema<ContactNumberTypeProjectionDocumentType>(
  {
    name: {
      type: String,
      required: true,
      description: 'Contact number type name'
    },
    status: {
      type: String,
      description: 'Contact number type status',
      enum: ['enabled', 'disabled']
    },
    order: {
      type: Number,
      required: true,
      description: 'Contact number type order'
    }
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    },
    collection: 'ContactNumberTypeProjection'
  }
);

export const ContactNumberTypeProjection = model<ContactNumberTypeProjectionDocumentType>(
  'ContactNumberTypeProjection',
  contactNumberType
);
