/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getCaselawV4 = /* GraphQL */ `
  query GetCaselawV4($ecli: String!, $DocSourceId: String!) {
    getCaselawV4(ecli: $ecli, DocSourceId: $DocSourceId) {
      DocSourceId
      SourceDocDate
      ecli
      instance
      alternative_publications
      case_number
      date_added
      date_decision
      date_publication
      display_subtitle
      display_title
      document_id
      document_type
      domains
      ecli_decision
      full_text
      info
      issue_number
      jurisdiction_city
      jurisdiction_country
      language
      legal_provision
      predecessor_successor_cases
      procedure_type
      publication_number
      referenced_legislation_titles
      source
      summary
      target_ecli
      title
      url_entry
      url_publication
      createdAt
      updatedAt
    }
  }
`;
export const listCaselawV4s = /* GraphQL */ `
  query ListCaselawV4s(
    $ecli: String
    $DocSourceId: ModelStringKeyConditionInput
    $filter: ModelCaselawV4FilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listCaselawV4s(
      ecli: $ecli
      DocSourceId: $DocSourceId
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        DocSourceId
        SourceDocDate
        ecli
        instance
        alternative_publications
        case_number
        date_added
        date_decision
        date_publication
        display_subtitle
        display_title
        document_id
        document_type
        domains
        ecli_decision
        full_text
        info
        issue_number
        jurisdiction_city
        jurisdiction_country
        language
        legal_provision
        predecessor_successor_cases
        procedure_type
        publication_number
        referenced_legislation_titles
        source
        summary
        target_ecli
        title
        url_entry
        url_publication
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const queryByDocSourceId = /* GraphQL */ `
  query QueryByDocSourceId(
    $DocSourceId: String
    $sortDirection: ModelSortDirection
    $filter: ModelCaselawV4FilterInput
    $limit: Int
    $nextToken: String
  ) {
    queryByDocSourceId(
      DocSourceId: $DocSourceId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        DocSourceId
        SourceDocDate
        ecli
        instance
        alternative_publications
        case_number
        date_added
        date_decision
        date_publication
        display_subtitle
        display_title
        document_id
        document_type
        domains
        ecli_decision
        full_text
        info
        issue_number
        jurisdiction_city
        jurisdiction_country
        language
        legal_provision
        predecessor_successor_cases
        procedure_type
        publication_number
        referenced_legislation_titles
        source
        summary
        target_ecli
        title
        url_entry
        url_publication
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const queryByInstance = /* GraphQL */ `
  query QueryByInstance(
    $instance: String
    $SourceDocDate: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelCaselawV4FilterInput
    $limit: Int
    $nextToken: String
  ) {
    queryByInstance(
      instance: $instance
      SourceDocDate: $SourceDocDate
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        DocSourceId
        SourceDocDate
        ecli
        instance
        alternative_publications
        case_number
        date_added
        date_decision
        date_publication
        display_subtitle
        display_title
        document_id
        document_type
        domains
        ecli_decision
        full_text
        info
        issue_number
        jurisdiction_city
        jurisdiction_country
        language
        legal_provision
        predecessor_successor_cases
        procedure_type
        publication_number
        referenced_legislation_titles
        source
        summary
        target_ecli
        title
        url_entry
        url_publication
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
