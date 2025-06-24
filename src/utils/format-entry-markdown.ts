export function formatEntryAsMarkdown(entry: JournalEntry): string {
    const tagString = (entry.tags ?? []).map((tag) => `#${tag}`).join(' ');
    const peopleString = entry.people?.join(', ') ?? '';
    const relatedString = entry.relatedTo?.join(', ') ?? '';
  
    return `
  ## ${entry.title} (${entry.date})
  
  - **Summary**: ${entry.summary}
  - **Tags**: ${tagString}
  - **People**: ${peopleString}
  - **Sentiment**: ${entry.sentiment}
  - **Related To**: ${relatedString}
  
  ---
  
  ${entry.body}
    `.trim();
  }
  