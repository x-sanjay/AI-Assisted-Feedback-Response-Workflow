const MODEL = "gemini-3.5-flash"; // if you get a 404, copy the exact name from AI Studio

function analyzeRow(sheet, row) {
  const feedback = sheet.getRange(row, 4).getValue();
  if (!feedback) return "skip";
  const key = PropertiesService.getScriptProperties().getProperty("GEMINI_KEY");

  const prompt =
    "You are a customer support analyst. Read the feedback and return JSON with keys " +
    "sentiment (Positive, Neutral or Negative), category (Bug, Billing, Feature Request, Praise or Other) " +
    "and reply (polite, 3 sentences or fewer).\n" +
    "Rules: if sarcastic, judge the real meaning. If unsure, use Neutral and Other. " +
    "Do not invent refunds, promises or facts.\n\nFeedback: " + feedback;

  let lastError = "";
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = UrlFetchApp.fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/" + MODEL + ":generateContent",
        {
          method: "post",
          contentType: "application/json",
          headers: { "x-goog-api-key": key },
          payload: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
          }),
          muteHttpExceptions: true
        }
      );
      const code = res.getResponseCode();
      const body = res.getContentText();

      if (code === 200) {
        const data = JSON.parse(body);
        const text = data.candidates && data.candidates[0] && data.candidates[0].content &&
                     data.candidates[0].content.parts && data.candidates[0].content.parts[0].text;
        if (text) {
          const out = JSON.parse(text);
          sheet.getRange(row, 5, 1, 3).setValues([[out.sentiment, out.category, out.reply]]);
          return "ok";
        }
      }
      lastError = code + ": " + body.slice(0, 150);
      if (code === 429) { // quota full: stop, do not retry
        sheet.getRange(row, 5).setValue("Error");
        sheet.getRange(row, 7).setValue("Quota full (429). Try later.");
        return "quota";
      }
      if (code === 503 || code === 500) { Utilities.sleep(5000); continue; } // busy: retry once
      break;
    } catch (err) {
      lastError = String(err);
      break;
    }
  }
  sheet.getRange(row, 5).setValue("Error");
  sheet.getRange(row, 7).setValue(lastError.slice(0, 200));
  return "error";
}

function formatRow(sheet, row) {
  sheet.getRange(row, 4, 1, 4).setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP); // columns D to G
  sheet.getRange(row, 1, 1, 7).setVerticalAlignment("top");
  sheet.setColumnWidth(7, 400);
  sheet.autoResizeRows(row, 1);
}

// Runs automatically on each new form response (set up as a trigger)
function onFormSubmit(e) {
  if (!e || !e.range) return;
  const sheet = e.range.getSheet();
  const row = e.range.getRow();
  analyzeRow(sheet, row);
  SpreadsheetApp.flush();
  formatRow(sheet, row);
}

// Run by hand to fill all rows where column E is empty
function processAll() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Form Responses 1") || ss.getSheets()[0];
  for (let r = 2; r <= sheet.getLastRow(); r++) {
    if (sheet.getRange(r, 5).getValue()) continue;
    const result = analyzeRow(sheet, r);
    if (result === "quota") break; // stop on quota error
    Utilities.sleep(4000);         // stay under rate limits
  }
}

// Run once to format rows that already exist
function formatAll() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Form Responses 1") || ss.getSheets()[0];
  for (let r = 2; r <= sheet.getLastRow(); r++) formatRow(sheet, r);
}
