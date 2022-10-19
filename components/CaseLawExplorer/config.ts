import Amplify from 'aws-amplify'
import * as R from 'colay/ramda'

const AWS_PROD_CONFIG = {
    "aws_project_region": "eu-central-1",
    "aws_appsync_graphqlEndpoint": "https://bxjbb3swx5g5xdkypdxwudyabe.appsync-api.eu-central-1.amazonaws.com/graphql",
    "aws_appsync_region": "eu-central-1",
    "aws_appsync_authenticationType": "AMAZON_COGNITO_USER_POOLS",
    "aws_cloud_logic_custom": [
        {
            "name": "GraphUtils",
            "endpoint": "https://mun9hnrt04.execute-api.eu-central-1.amazonaws.com/dev",
            "region": "eu-central-1",
            "authorizationType": "NONE",
        }
    ],
    "aws_cognito_identity_pool_id": "eu-central-1:9c996483-c659-4953-ba11-bbe145997d59",
    "aws_cognito_region": "eu-central-1",
    "aws_user_pools_id": "eu-central-1_Iia5Ube9G",
    "aws_user_pools_web_client_id": "529do26g6icslepgrvcelapu8v",
    "oauth": {
        "domain": "case-law-explorer-dev.eu-central-1.amazoncognito.com",
        "scope": [
            "phone",
            "email",
            "openid",
            "profile",
            "aws.cognito.signin.user.admin"
        ],
        "redirectSignIn": "https://optimisation.d11iy22xsphp3a.amplifyapp.com/",
        "redirectSignOut": "https://optimisation.d11iy22xsphp3a.amplifyapp.com/",
        "responseType": "code"
    },
    "federationTarget": "COGNITO_USER_POOLS",
    "aws_cognito_username_attributes": [
        "EMAIL"
    ],
    "aws_cognito_social_providers": [],
    "aws_cognito_signup_attributes": [
        "EMAIL"
    ],
    "aws_cognito_mfa_configuration": "OFF",
    "aws_cognito_mfa_types": [
        "SMS"
    ],
    "aws_cognito_password_protection_settings": {
        "passwordPolicyMinLength": 8,
        "passwordPolicyCharacters": []
    },
    "aws_cognito_verification_mechanisms": [
        "EMAIL"
    ]
}

const AWS_DEV_CONFIG_OVERRIDE = {
  "oauth": {
      "redirectSignIn": "http://localhost:19006/",
      "redirectSignOut": "http://localhost:19006/",
  },
}

export const AWS_CONFIG = __DEV__
  ? R.mergeDeepRight(AWS_PROD_CONFIG, AWS_DEV_CONFIG_OVERRIDE)
  : AWS_PROD_CONFIG

Amplify.configure(AWS_CONFIG);
