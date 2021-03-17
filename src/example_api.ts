import { API } from 'aws-amplify';
import * as queries from './graphql/queries';

// Query using a parameter
const oneTodo = await API.graphql({ query: queries.giveMeAllTheData, variables: { 
    DataSources: ["TEST"],
    Keywords: [""],
    Articles: [""],
    Eclis: ["TEST:ECLI:001"],
    DegreesSources: 3,
    DegreesTargets: 3,
    DateStart: "1996-01-11",
    DateEnd: "2100-01-14",
    Instances: ["TEST_court001"],
    Domains: ["TEST_domain001"],
    Doctypes: ["OPI", "DEC"],
    LiPermission: false 
}});