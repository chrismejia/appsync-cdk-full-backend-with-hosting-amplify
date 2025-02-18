#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { AuthStack } from "../lib/AuthStack";
import { FileStorageStack } from "../lib/FileStorageStack";
import { DatabaseStack } from "../lib/DatabaseStack";
import { IdentityStack } from "../lib/IdentityStack";
import { APIStack } from "../lib/APIStack";
import { AmplifyHostingStack } from "../lib/NextjsHostingStack";

const app = new cdk.App();

const authStack = new AuthStack(app, "ProductAuthStack", {});

const identityStack = new IdentityStack(app, "ProductIdentityStack", {
  userpool: authStack.userpool,
  userpoolClient: authStack.userPoolClient,
});

const databaseStack = new DatabaseStack(app, "ProductDatabaseStack", {});

const apiStack = new APIStack(app, "ProductAppSyncAPIStack", {
  userpool: authStack.userpool,
  sampleTable: databaseStack.productTable,
  unauthenticatedRole: identityStack.unauthenticatedRole,
  identityPool: identityStack.identityPool,
});

const fileStorageStack = new FileStorageStack(app, "ProductFileStorageStack", {
  authenticatedRole: identityStack.authenticatedRole,
  unauthenticatedRole: identityStack.unauthenticatedRole,
  allowedOrigins: ["http://localhost:3000"],
});

const amplifyHostingStack = new AmplifyHostingStack(
  app,
  "ProductHostingStack",
  {
    // Name given to plaintext secret in secretsManager.
    // When creating the token scope on Github, only the admin:repo_hook scope is needed
    githubOauthTokenName: "Test-Next-Amplify-AWS",
    // swap for your github username
    owner: "chrismejia",
    // swap for your github frontend repo
    repository: "sample-next-frontend",
    //pass in any envVars from the above stacks here
    environmentVariables: {
      USERPOOL_ID: authStack.userpool.userPoolId,
      GRAPHQL_URL: apiStack.graphqlURL,
    },
  }
);
