# Reclaim Protocol Provider Configuration - Regex Explanation

## Overview
This document explains the regex patterns used for extracting educational credentials from university portals via Reclaim Protocol.

---

## Target 1: Canvas LMS - Student Profile API

### Target URL Pattern
```
*/api/v1/users/self/profile
```

### Expected JSON Response Format
```json
{
  "id": 123456,
  "name": "John Doe",
  "primary_email": "john.doe@university.edu",
  "login_id": "jdoe",
  "avatar_url": "https://...",
  "locale": "en"
}
```

### Regex Patterns

#### 1. Extract Student Name
```regex
"name"\s*:\s*"([^"]+)"
```

**Breakdown:**
- `"name"` - Matches the literal string "name"
- `\s*` - Matches zero or more whitespace characters
- `:` - Matches the colon separator
- `\s*` - Matches zero or more whitespace characters
- `"` - Matches opening quote
- `([^"]+)` - **Capture Group 1**: Captures one or more characters that are NOT quotes (the actual name)
- `"` - Matches closing quote

**Example Match:**
```json
"name": "John Doe"
         ^^^^^^^^ (captured)
```

---

#### 2. Extract Primary Email
```regex
"primary_email"\s*:\s*"([^"]+)"
```

**Breakdown:**
- `"primary_email"` - Matches the literal string "primary_email"
- `\s*:\s*` - Matches colon with optional whitespace
- `"([^"]+)"` - **Capture Group 1**: Captures the email address between quotes

**Example Match:**
```json
"primary_email": "john.doe@university.edu"
                  ^^^^^^^^^^^^^^^^^^^^^^^ (captured)
```

---

#### 3. Extract Student ID
```regex
"id"\s*:\s*(\d+)
```

**Breakdown:**
- `"id"` - Matches the literal string "id"
- `\s*:\s*` - Matches colon with optional whitespace
- `(\d+)` - **Capture Group 1**: Captures one or more digits (the numeric ID)

**Example Match:**
```json
"id": 123456
      ^^^^^^ (captured)
```

**Note:** No quotes around the number since JSON numbers are unquoted.

---

## Target 2: Generic Gradebook HTML

### Expected HTML Structure
```html
<table class="gradebook">
  <tr>
    <td class="course">Computer Science</td>
    <td class="credits">3</td>
    <td class="grade-cell">
      <span class="grade">A</span>
    </td>
  </tr>
  <tr>
    <td class="course">Mathematics</td>
    <td class="credits">4</td>
    <td class="grade-cell">
      <span class="grade">B+</span>
    </td>
  </tr>
</table>
```

### Combined Regex Pattern
```regex
<td[^>]*class="course"[^>]*>\s*([^<]+)\s*</td>(?:(?!</tr>).)*<span[^>]*class="grade"[^>]*>\s*([^<]+)\s*</span>
```

**Breakdown:**

#### Part 1: Capture Course Name
```regex
<td[^>]*class="course"[^>]*>\s*([^<]+)\s*</td>
```

- `<td` - Matches opening `<td` tag
- `[^>]*` - Matches any characters except `>` (other attributes)
- `class="course"` - Matches the course class attribute
- `[^>]*>` - Matches remaining attributes and closing `>`
- `\s*` - Matches optional whitespace
- `([^<]+)` - **Capture Group 1**: Captures the course name (everything until `<`)
- `\s*</td>` - Matches optional whitespace and closing tag

**Example Match:**
```html
<td class="course">Computer Science</td>
                   ^^^^^^^^^^^^^^^^ (captured as Group 1)
```

---

#### Part 2: Bridge Between Elements
```regex
(?:(?!</tr>).)*
```

- `(?:...)` - Non-capturing group
- `(?!</tr>)` - Negative lookahead: ensure we're NOT at a `</tr>` tag
- `.` - Match any character
- `*` - Zero or more times

**Purpose:** This allows the regex to skip over any HTML between the course `<td>` and the grade `<span>`, but STOPS at the end of the table row (`</tr>`). This ensures we match course and grade from the SAME row.

---

#### Part 3: Capture Grade
```regex
<span[^>]*class="grade"[^>]*>\s*([^<]+)\s*</span>
```

- `<span` - Matches opening `<span` tag
- `[^>]*` - Matches any attributes before class
- `class="grade"` - Matches the grade class attribute
- `[^>]*>` - Matches remaining attributes and closing `>`
- `\s*` - Matches optional whitespace
- `([^<]+)` - **Capture Group 2**: Captures the grade value (A, B+, etc.)
- `\s*</span>` - Matches optional whitespace and closing tag

**Example Match:**
```html
<span class="grade">A</span>
                    ^ (captured as Group 2)
```

---

### Complete Match Example

**Input HTML:**
```html
<td class="course">Computer Science</td>
<td class="credits">3</td>
<td class="grade-cell">
  <span class="grade">A</span>
</td>
```

**Captured Groups:**
- **Group 1:** `Computer Science`
- **Group 2:** `A`

---

## Reclaim Portal Configuration

### For Canvas LMS Provider

Paste this into Reclaim Developer Portal → Create Custom Provider:

```json
{
  "url": "*/api/v1/users/self/profile",
  "loginUrl": "https://canvas.instructure.com/login",
  "responseSelections": [
    {
      "responseMatch": "\"name\"\\s*:\\s*\"([^\"]+)\"",
      "xPath": ""
    },
    {
      "responseMatch": "\"primary_email\"\\s*:\\s*\"([^\"]+)\"",
      "xPath": ""
    },
    {
      "responseMatch": "\"id\"\\s*:\\s*(\\d+)",
      "xPath": ""
    }
  ]
}
```

---

### For Generic Gradebook Provider

Paste this into Reclaim Developer Portal → Create Custom Provider:

```json
{
  "url": "*gradebook*",
  "loginUrl": "https://your-university-portal.edu/login",
  "responseSelections": [
    {
      "responseMatch": "<td[^>]*class=\"course\"[^>]*>\\s*([^<]+)\\s*</td>(?:(?!</tr>).)*<span[^>]*class=\"grade\"[^>]*>\\s*([^<]+)\\s*</span>",
      "xPath": ""
    }
  ]
}
```

---

## Testing Your Regex

### Online Regex Testers
1. **regex101.com** - Best for detailed explanation
2. **regexr.com** - Visual highlighting
3. **regextester.com** - Simple testing

### Test Data

**Canvas JSON:**
```json
{"id": 123456, "name": "Jane Smith", "primary_email": "jane.smith@edu.edu"}
```

**Gradebook HTML:**
```html
<tr><td class="course">Biology</td><td><span class="grade">A-</span></td></tr>
```

---

## Common Issues & Solutions

### Issue 1: Escaped Quotes in JSON
**Problem:** Reclaim Portal requires double-escaped quotes in regex
**Solution:** Use `\\\"` instead of `\"` when pasting into Reclaim Portal

### Issue 2: Whitespace Variations
**Problem:** HTML/JSON may have inconsistent spacing
**Solution:** Use `\s*` (zero or more spaces) liberally

### Issue 3: Multi-line HTML
**Problem:** Grade span might be on different line than course td
**Solution:** Use `(?:(?!</tr>).)*` to match across lines within same row

### Issue 4: Multiple Courses
**Problem:** Need to extract ALL courses, not just first
**Solution:** Reclaim Protocol automatically applies regex globally - each match creates a separate claim

---

## Integration with EduSeal

Once configured in Reclaim Portal, use the Provider ID in your `.env`:

```bash
VITE_RECLAIM_PROVIDER_ID=your-canvas-provider-id-here
```

The `ShadowMint.tsx` component will then:
1. Trigger Reclaim proof generation
2. User completes verification in their browser
3. Proof returned with extracted data (name, email, grades)
4. Smart contract verifies proof and mints credential NFT

---

## Advanced: XPath Alternative

For complex HTML structures, you can also use XPath selectors:

```json
{
  "responseMatch": "",
  "xPath": "//td[@class='course']/text()"
}
```

However, regex is more flexible for capturing multiple groups in one pattern.
