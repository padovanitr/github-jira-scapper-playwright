declare namespace NodeJS {
  interface ProcessEnv {
    GITHUB_USER_NAME: string;
    GITHUB_PASSWORD: string;
    JIRA_AUTH_COOKIE: string;
    JIRA_PROJECT_DOMAIN: string;
    GUTHUB_REPO_URL: string;
  }
}
