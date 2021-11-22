import {TestUtilsZSchemaFormatter} from '../tools/TestUtilsZSchemaFormatter';
import ZSchema from 'z-schema';
import {assert} from 'chai';
import {api} from '../tools/TestUtilsApi';
import {getJWT} from '../tools/TestUtilsJwt';
import _ from 'lodash';
import {ContactNumberTypeScenario} from './scenarios/ContactNumberTypeScenario';
import {AgencyConsultantRolesProjectionScenarios} from './scenarios/AgencyConsultantRolesProjectionScenarios';

TestUtilsZSchemaFormatter.format();
const validator = new ZSchema({});

