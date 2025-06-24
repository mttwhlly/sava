import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';
import { formatEntryAsMarkdown } from '@/utils/format-entry-markdown';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const { entry, to } = await req.json();

  const markdown = formatEntryAsMarkdown(entry);

  try {
    const data = await resend.emails.send({
      from: process.env.FROM_EMAIL!,
      to,
      subject: `[Journal Entry] ${entry.title}`,
      text: markdown,
    });

    return NextResponse.json({ status: 'sent', data });
  } catch (err: any) {
    console.error('[SEND TO TANA ERROR]', err);
    return NextResponse.json(
      { error: 'Failed to send email', detail: err.message },
      { status: 500 }
    );
  }
}
