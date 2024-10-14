# PR Playwright Scraper

This project uses [Playwright](https://playwright.dev/) to automate scraping of GitHub pull requests from a specified repository. It filters pull requests with titles that contain the word "term" (case-insensitive), removes duplicates, and saves the results in a JSON file.

## Features

- Logs into GitHub using credentials provided via environment variables.
- Scrapes pull requests from a given repository URL.
- Filters PRs that contain "term" in the title.
- Removes duplicate PRs based on the title.
- Saves the result to a `prList.json` file.

## Prerequisites

- [Node.js](https://nodejs.org/) (version 14 or higher)
- GitHub credentials (username and password)
- [Playwright](https://playwright.dev/) browser automation library

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/pr-playwright-scrapping.git
   cd pr-playwright-scrapping

   ```

2. Install dependencies:
   pnpm install

3. Create a `.env` file in the project root and add your GitHub credentials:
   GITHUB_USER_NAME=your-github-username
   GITHUB_PASSWORD=your-github-password

4. Call the function `scrapePRs`
   Uncomment the function and add the necessary props to it.

5. Build the project:
   pnpm run build

6. Run the script:
   pnpm start
