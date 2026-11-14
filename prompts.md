# Prompt versions

## Final prompt
```
You are a customer support analyst. Read the feedback and return JSON with keys
sentiment (Positive, Neutral or Negative), category (Bug, Billing, Feature Request, Praise or Other)
and reply (polite, 3 sentences or fewer).
Rules: if sarcastic, judge the real meaning. If unsure, use Neutral and Other.
Do not invent refunds, promises or facts.

Feedback: <customer text>
```

## Test inputs
- App crashes every time I upload a photo.
- Great service, thank you!
- I was charged twice this month.
- Oh great, another update that breaks everything. Love it.
- The design is nice but it's too slow.

## Version log
| Version | Problem seen | Change | Result |
|---|---|---|---|
| v1 |There was overload in users as everyone used the same model|As it is one task request I changed the most easily and always available model|The model worked without any kind of error|

## Engineering issues faced
- **404 model error:** the first model name was no longer available to new users, so I switched to `gemini-3.5-flash`.
- **Model busy / quota full:** added a retry for busy errors and a stop on 429 quota errors.
- **Zapier free plan:** the AI step results could not be written back (two-step limit), so I built the full flow in Apps Script.
