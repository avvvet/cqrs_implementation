import {ClientContactNumberProjection} from '../../../src/models/ClientContactNumberProjection';
import {assign} from 'lodash';

export class ClientContactNumberProjectionScenarios {
  /**
   * create the record
   *
   * @param opts - overrides the record properties
   */
  static async create(opts?: any): Promise<void> {
    await ClientContactNumberProjection.create(
      assign(
        {
          type_id: '61d5911225ace3a26eda579d',
          type_name: 'mobile',
          type_order: 1,
          contact_number: '+442087599088',
          __v: 0
        },
        opts
      )
    );
  }

  /**
   * remove all records
   */
  static async removeAll(): Promise<void> {
    await ClientContactNumberProjection.deleteMany({});
  }
}
