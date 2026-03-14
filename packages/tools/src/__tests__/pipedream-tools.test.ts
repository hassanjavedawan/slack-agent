import type { PipedreamAction } from "@openviktor/integrations";
import { describe, expect, it } from "vitest";
import { generateSkillContent } from "../tools/integrations/pipedream-tools.js";

describe("generateSkillContent", () => {
	const mockActions: PipedreamAction[] = [
		{
			id: "action-1",
			key: "google_sheets-add-single-row",
			name: "Add Single Row",
			description: "Add a single row of data to a Google Sheet",
			version: "0.2.0",
			configurable_props: [
				{ name: "google_sheets", type: "app", app: "google_sheets" },
				{ name: "sheetId", type: "string", label: "Spreadsheet" },
				{ name: "worksheetId", type: "string", label: "Worksheet" },
				{ name: "myColumnData", type: "string[]", label: "Row Data" },
			],
		},
		{
			id: "action-2",
			key: "google_sheets-update-row",
			name: "Update Row",
			description: "Update an existing row in a Google Sheet",
			version: "0.1.0",
			configurable_props: [
				{ name: "google_sheets", type: "app", app: "google_sheets" },
				{ name: "sheetId", type: "string", label: "Spreadsheet" },
				{ name: "row", type: "integer", label: "Row Number" },
			],
		},
	];

	it("generates SKILL.md content with YAML frontmatter", () => {
		const content = generateSkillContent("google_sheets", "Google Sheets", mockActions);

		expect(content).toContain("name: pd_google_sheets");
		expect(content).toContain("description: >");
		expect(content).toContain("## Available Tools");
	});

	it("includes all action tools with correct names", () => {
		const content = generateSkillContent("google_sheets", "Google Sheets", mockActions);

		expect(content).toContain("### mcp_pd_google_sheets_add_single_row");
		expect(content).toContain("### mcp_pd_google_sheets_update_row");
	});

	it("includes action descriptions", () => {
		const content = generateSkillContent("google_sheets", "Google Sheets", mockActions);

		expect(content).toContain("Add a single row of data to a Google Sheet");
		expect(content).toContain("Update an existing row in a Google Sheet");
	});

	it("lists parameters for each action (excluding app props)", () => {
		const content = generateSkillContent("google_sheets", "Google Sheets", mockActions);

		expect(content).toContain("sheetId (string)");
		expect(content).toContain("worksheetId (string)");
		expect(content).toContain("myColumnData (string[])");
		expect(content).not.toContain("google_sheets (app)");
	});

	it("includes configure tool", () => {
		const content = generateSkillContent("google_sheets", "Google Sheets", mockActions);

		expect(content).toContain("### mcp_pd_google_sheets_configure");
		expect(content).toContain("Discover dynamic properties");
	});

	it("includes all proxy tools", () => {
		const content = generateSkillContent("google_sheets", "Google Sheets", mockActions);

		expect(content).toContain("### mcp_pd_google_sheets_proxy_get");
		expect(content).toContain("### mcp_pd_google_sheets_proxy_post");
		expect(content).toContain("### mcp_pd_google_sheets_proxy_put");
		expect(content).toContain("### mcp_pd_google_sheets_proxy_patch");
		expect(content).toContain("### mcp_pd_google_sheets_proxy_delete");
	});

	it("mentions the app name in proxy descriptions", () => {
		const content = generateSkillContent("google_sheets", "Google Sheets", mockActions);

		expect(content).toContain("Google Sheets API auth");
	});
});
