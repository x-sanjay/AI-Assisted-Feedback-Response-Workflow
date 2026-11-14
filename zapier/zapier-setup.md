# Zapier version

The same feedback workflow built in Zapier using the Google AI Studio (Gemini) app.

## Flow
Google Sheets (New Spreadsheet Row) → Google AI Studio (Gemini): Send Prompt

## Setup
1. Create a Zap with trigger **Google Sheets → New Spreadsheet Row**, using the Form Responses 1 worksheet.
2. Add action **Google AI Studio (Gemini) → Send Prompt**.
3. Connect with a Gemini API key from aistudio.google.com.
4. Set the model to `gemini-3.5-flash`.
5. Paste the prompt below and insert the Feedback field from the trigger.
6. Test the step, then publish.

## Prompt
```
You are a customer support analyst. Read the feedback below. Reply in exactly this format:
Sentiment: Positive, Neutral or Negative
Category: Bug, Billing, Feature Request, Praise or Other
Reply: polite, 3 sentences or fewer.
Rules: judge sarcasm by its real meaning; if unsure use Neutral and Other; never invent refunds or promises.

Feedback: <Feedback field from the trigger>
```

## Result
The AI reply is visible in Zap runs (Data out of the Gemini step).
See `screenshots/zapier-output.png`.

## Limitation on the free plan
The free Zapier plan allows only two-step Zaps (trigger + one action), so a third step that writes the result back to the Sheet was not possible. The Apps Script version does the write-back.
