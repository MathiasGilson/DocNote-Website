---
title: "DocNote x Axenita: set up the connection and send reports to the patient file (video)"
translationKey: "axenita-integration-tutorial"
excerpt: "Configure the Axenita web portal and FHIR API client, open DocNote from the patient file, generate a report and send it back into Axenita. Video in French."
category: "guides"
tags: ["tutorial", "video", "ehr-integration", "axenita"]
author: "Dr. Alice Gilson"
authorRole: "Doctor & Managing Director"
authorImage: "/images/dre_alice_gilson.jpg"
authorUrl: "https://www.linkedin.com/in/alice-gilson-816390251/"
image: "../../../assets/blog/yt-axenita-integration-tutorial.jpg"
fullImage: true
date: "2026-08-31"
---

<div class="video-embed"><iframe src="https://www.youtube-nocookie.com/embed/wpQYYmleWZg" title="DocNote x Axenita: set up the connection and send reports to the patient file (video)" loading="lazy" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div>

DocNote can now be used directly from the Axenita electronic patient record. You open DocNote from the patient file, generate your report, and send it straight back into Axenita, with no copy-paste and no change to your routine. This video (in French) covers the one-time configuration and then the daily workflow. Both are written out below, including the exact values to enter.

## Part 1: one-time configuration in Axenita

### Add the DocNote web portal

Sign in to Axenita, go to **Settings**, then **Database**. At the bottom of the page you will find the **Web portal** section. Add a new portal, name it `DocNote`, and enter the following URL. No username is required.

```
https://docnote.care/app/record?patientId={patientId}&patientIdSystem={patientIdOid}&firstName={patientFirstname}&lastName={patientLastname}&sex={patientGender}&birthday={patientBirthdate|dd.MM.yyyy}&language={patientCorrespondenceLanguage}
```

Save the portal. The placeholders in braces are filled in by Axenita at launch, which is how DocNote knows which patient it was opened for.

### Create the FHIR API client

Go to the **FHIR-API** section and add a new client, again named `DocNote` so the connection is easy to identify. Axenita generates an **external client ID** and a **client secret**. Copy both and send them to the DocNote team by email: we use them to finalize the connection between your Axenita environment and your DocNote account.

### Grant the permissions

Select the DocNote client you just created, then add these three permissions one after the other:

- `system/Composition.c`
- `system/Encounter.c`
- `system/Patient.c`

Make sure the DocNote client is selected before adding them, so they are attributed to the right client. If anything is unclear, both the Axenita and DocNote teams are available to help with the setup.

## Part 2: daily use

Once the connection has been activated and confirmed by the DocNote team, go back to the patient file and work as usual.

1. **Open DocNote from Axenita.** Click "External call", the icon to the right of the printer, and select DocNote. The app opens automatically. On first use, check in DocNote's settings that the Axenita connection shows as active.
2. **Record or dictate and generate** your report exactly as you normally do in DocNote.
3. **Send it to the patient file.** Click the share option and choose "Send to patient file". Because DocNote was opened from the patient's file in Axenita, the patient is identified automatically. Confirm and the report is sent.
4. **Integrate it in Axenita.** Close DocNote, return to the patient file and click the double-arrow icon. The content transmitted from DocNote appears there. Select the corresponding consultation, click "Add" and validate.

The report is now part of the patient file. It remains fully editable in Axenita until you validate it definitively.

## Why we built it this way

The Axenita integration relies on the FHIR standard, which means the report is transmitted as a structured document rather than pasted text, and the patient identity travels with it. For the doctor, the visible result is simpler: one click to open DocNote, one click to send, and nothing to retype.
