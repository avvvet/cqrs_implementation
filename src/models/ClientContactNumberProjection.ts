import {Document, Schema, model} from 'mongoose';

export type ClientContactNumberProjectionDocumentType = Document & {
  _id: string;
  client_id: string;
  type_id: string;
  type_name: string;
  type_order: number;
  contact_number: string;
  last_sequence_id: number;
};

const clientContactNumber = new Schema<ClientContactNumberProjectionDocumentType>(
  {
    client_id: {
      type: String,
      required: true,
      description: 'Client Id'
    },
    type_id: {
      type: String,
      required: true,
      description: 'Contact number type id'
    },
    type_name: {
      type: String,
      required: true,
      description: 'Contact number type name'
    },
    type_order: {
      type: Number,
      required: true,
      description: 'Contact number type order'
    },
    contact_number: {
      type: String,
      required: true,
      description: 'Client Contact number'
    }
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    },
    collection: 'ClientContactNumberProjection'
  }
);

export const ClientContactNumberProjection = model<ClientContactNumberProjectionDocumentType>(
  'ClientContactNumberProjection',
  clientContactNumber
);
