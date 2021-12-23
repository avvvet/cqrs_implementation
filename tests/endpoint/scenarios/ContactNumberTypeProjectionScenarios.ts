import {ContactNumberTypeProjection} from '../../../src/models/ContactNumberTypeProjection';
import {assign} from 'lodash';

export class ContactNumberTypeProjectionScenarios {
  /**
   * create the record
   *
   * @param opts - overrides the record properties
   */
  static async create(opts?: any): Promise<void> {
    await ContactNumberTypeProjection.create(
      assign(
        {
          name: 'mobile',
          order: 1,
          status: 'enabled'
        },
        opts
      )
    );
  }

  /**
   * remove all records
   */
  static async removeAll(): Promise<void> {
    await ContactNumberTypeProjection.deleteMany({});
  }
}
