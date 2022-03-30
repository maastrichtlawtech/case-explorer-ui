# case-explorer-ui

Materials for building a network analysis software platform for analyzing Dutch and European court decisions. This repository builds on the work by Dafne van Kuppevelt of the Netherlands e-Science Centre [NLeSC/case-law-app](https://github.com/NLeSC/case-law-app).


SETUP:
- amplify add api:
    - add GraphQL schema to define table and queries
    after first pushing GraphQL table schema:
    - manually re-create global secondary indexes in AWS DynamoDB console and only project strictly necessary attributes to minimize storage/query costs
    - run Elasticsearch re-indexing script to use correct field mapping
- amplify add function
- amplify add auth
