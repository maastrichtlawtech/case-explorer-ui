/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createCaselaw = /* GraphQL */ `
  mutation CreateCaselaw(
    $input: CreateCaselawInput!
    $condition: ModelCaselawConditionInput
  ) {
    createCaselaw(input: $input, condition: $condition) {
      ItemType
      SourceDocDate
      ecli
      instance
      instance_li
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateCaselaw = /* GraphQL */ `
  mutation UpdateCaselaw(
    $input: UpdateCaselawInput!
    $condition: ModelCaselawConditionInput
  ) {
    updateCaselaw(input: $input, condition: $condition) {
      ItemType
      SourceDocDate
      ecli
      instance
      instance_li
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteCaselaw = /* GraphQL */ `
  mutation DeleteCaselaw(
    $input: DeleteCaselawInput!
    $condition: ModelCaselawConditionInput
  ) {
    deleteCaselaw(input: $input, condition: $condition) {
      ItemType
      SourceDocDate
      ecli
      instance
      instance_li
      createdAt
      updatedAt
      __typename
    }
  }
`;
