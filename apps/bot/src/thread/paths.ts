export function generateSlackThreadPath(userId: string, threadTs: string): string {
	return `/slack/${userId}/${threadTs}`;
}

export function generateCronThreadPath(cronName: string): string {
	const now = new Date();
	const iso = now.toISOString().replace(/[:.]/g, "-").slice(0, 19);
	return `/${cronName.toLowerCase()}/threads/${iso}`;
}

export function generateSpawnPath(parentPath: string, childName: string): string {
	return `${parentPath}/threads/${childName}`;
}

export function isChildPath(parentPath: string, childPath: string): boolean {
	return childPath.startsWith(`${parentPath}/threads/`);
}
