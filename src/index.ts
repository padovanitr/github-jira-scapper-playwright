import * as dotenv from "dotenv";
import { chromium } from "playwright";
import * as fs from "fs";
import { GITHUB_BASE_URL } from "./utils/constants";

dotenv.config();

type PRList = { title: string; link: string }[];

type ScrapePRsArgs = {
  repositoryUrl: string;
  matchTerm: string;
  termToExclude?: string;
};

export async function scrapePRs({
  repositoryUrl,
  matchTerm,
  termToExclude,
}: ScrapePRsArgs): Promise<void> {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(`${GITHUB_BASE_URL}/login`);

  const username = process.env.GITHUB_USER_NAME;
  const password = process.env.GITHUB_PASSWORD;

  await page.fill('input[name="login"]', username ?? "");
  await page.fill('input[name="password"]', password ?? "");
  await page.click('input[type="submit"]');

  await page.waitForTimeout(20000);

  await page.goto(`${GITHUB_BASE_URL}/${repositoryUrl}`);

  const prsWithTerm: PRList = [];
  let hasNextPage = true;

  while (hasNextPage) {
    await page.waitForSelector(".js-issue-row");

    const prTitles = await page.$$eval(".js-issue-row", (prs) =>
      prs.map((pr) => {
        const title = pr.querySelector(".js-navigation-open")?.innerText ?? "";
        const link = pr.querySelector(".js-navigation-open")?.href ?? "";
        return { title, link };
      })
    );

    console.log("prTitles", prTitles);

    const filteredPRs = prTitles.filter((pr) => {
      const match =
        pr.title.toLowerCase().includes(matchTerm) &&
        !pr.title.toLowerCase().includes(termToExclude);
      return match;
    });

    console.log("filteredPRs", filteredPRs);
    const refined = filteredPRs.map((pr) => {
      return {
        title: pr.title.split(":")[0],
        link: pr.link,
      };
    });

    console.log("refined", refined);
    prsWithTerm.push(...refined);

    const nextPage = await page.$('a[rel="next"]');
    if (nextPage) {
      await nextPage.click();
      await page.waitForNavigation();
    } else {
      hasNextPage = false;
    }
  }

  const uniquePRs = prsWithTerm.filter(
    (pr, index, self) => index === self.findIndex((t) => t.title === pr.title)
  );

  console.log(`Unique PRs with ${matchTerm} in the title:`, uniquePRs);

  const filePath = "./prList.json";

  try {
    fs.writeFileSync(filePath, JSON.stringify(uniquePRs, null, 2));
    console.log(`Results saved to ${filePath}`);
  } catch (error) {
    console.error("Error writing to file:", error);
  }

  await browser.close();
}

// Call this with necassary props
// E.g.
scrapePRs({
  repositoryUrl: process.env.GUTHUB_REPO_URL || "",
  matchTerm: "term",
  termToExclude: "bug",
});
