import * as dotenv from "dotenv";
import { chromium } from "playwright";
import * as fs from "fs";
import prList from "../prList.json";

dotenv.config();

type IssueList = {
  title: string;
  storyPoints: string | null;
}[];

type ScrapeJiraStoryPointsArgs = {
  issueTitles: {
    title: string;
    link: string;
  }[];
  jiraBaseUrl: string;
};

export async function scrapeJiraStoryPoints({
  issueTitles,
  jiraBaseUrl,
}: ScrapeJiraStoryPointsArgs): Promise<IssueList> {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(`${jiraBaseUrl}`);

  await context.addCookies([
    {
      name: "tenant.session.token",
      value: process.env.JIRA_AUTH_COOKIE,
      domain: process.env.JIRA_PROJECT_DOMAIN,
      path: "/",
      httpOnly: true,
      secure: true,
    },
  ]);

  await page.waitForTimeout(5000);

  const issueListWithStoryPoints: IssueList = [];

  for (const issueTitle of issueTitles) {
    const issueUrl = `https://${process.env.JIRA_PROJECT_DOMAIN}/browse/${issueTitle.title}`;
    await page.goto(issueUrl);

    console.log("issueListWithStoryPoints", issueListWithStoryPoints);

    try {
      const parentElement = await page
        .locator(
          '//*[@id="ak-main-content"]/div/div/div/div[3]/div[2]/div[2]/div/div[3]/div/div[2]/div[3]/div[2]/div[1]/div/div/details/div/div/div[7]/div/div/div[2]/div/div/form/div/div/div/div/span'
        )
        .textContent();

      console.log("parentElement", parentElement);

      if (parentElement !== "None") {
        console.log("entrou aqui");

        const storyPoints = await page
          .locator(
            '//*[@id="ak-main-content"]/div/div/div/div[3]/div[2]/div[2]/div/div[3]/div/div[2]/div[3]/div[2]/div[1]/div/div/details/div/div/div[7]/div/div/div[2]/div/div/form/div/div/div/div/span/span'
          )
          .textContent();

        issueListWithStoryPoints.push({
          title: issueTitle.title,
          storyPoints,
        });
      }
    } catch (error) {
      console.error(
        `Could not find story points for issue: ${issueTitle}`,
        error
      );
    }
  }

  const filePath = "./storyPointsList.json";

  try {
    fs.writeFileSync(
      filePath,
      JSON.stringify(issueListWithStoryPoints, null, 2)
    );
    console.log(`Results saved to ${filePath}`);
  } catch (error) {
    console.error("Error writing to file:", error);
  }

  await browser.close();

  return issueListWithStoryPoints;
}

scrapeJiraStoryPoints({
  issueTitles: prList,
  jiraBaseUrl: `https://${process.env.JIRA_PROJECT_DOMAIN}/jira/software/projects/CONV/boards/226`,
}).then((results) => {
  console.log("Story Points:", results);
});
