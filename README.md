# case-explorer-ui

SETUP:
- amplify add api:
    - add GraphQL schema to define table and queries
    after first pushing GraphQL table schema:
    - manually re-create global secondary indexes in AWS DynamoDB console and only project strictly necessary attributes to minimize storage/query costs
    - run Elasticsearch re-indexing script to use correct field mapping
- amplify add function
- amplify add auth
