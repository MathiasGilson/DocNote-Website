---
title: "DocNote x Axenita: Verbindung einrichten und Berichte in die Patientenakte senden (Video)"
translationKey: "axenita-integration-tutorial"
excerpt: "Webportal und FHIR-API-Client in Axenita einrichten, DocNote aus der Patientenakte öffnen, einen Bericht generieren und ihn zurück nach Axenita senden. Video auf Französisch."
category: "guides"
tags: ["tutorial", "video", "ehr-integration", "axenita"]
author: "Dr. Alice Gilson"
authorRole: "Ärztin & Geschäftsführerin"
authorImage: "/images/dre_alice_gilson.jpg"
authorUrl: "https://www.linkedin.com/in/alice-gilson-816390251/"
image: "../../../assets/blog/yt-axenita-integration-tutorial.jpg"
fullImage: true
date: "2026-08-31"
---

<div class="video-embed"><iframe src="https://www.youtube-nocookie.com/embed/wpQYYmleWZg" title="DocNote x Axenita: Verbindung einrichten und Berichte in die Patientenakte senden (Video)" loading="lazy" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div>

DocNote lässt sich jetzt direkt aus der elektronischen Patientenakte Axenita nutzen. Sie öffnen DocNote aus der Patientenakte, generieren Ihren Bericht und senden ihn direkt zurück nach Axenita, ohne Copy-Paste und ohne Änderung Ihrer Abläufe. Dieses Video (auf Französisch) behandelt die einmalige Konfiguration und danach den täglichen Arbeitsablauf. Beides ist unten ausgeschrieben, inklusive der exakt einzutragenden Werte.

## Teil 1: einmalige Konfiguration in Axenita

### Das DocNote-Webportal hinzufügen

Melden Sie sich in Axenita an, gehen Sie zu **Einstellungen**, dann **Datenbank**. Am Seitenende finden Sie den Abschnitt **Webportal**. Fügen Sie ein neues Portal hinzu, nennen Sie es `DocNote` und tragen Sie folgende URL ein. Ein Benutzername ist nicht nötig.

```
https://docnote.care/app/record?patientId={patientId}&patientIdSystem={patientIdOid}&firstName={patientFirstname}&lastName={patientLastname}&sex={patientGender}&birthday={patientBirthdate|dd.MM.yyyy}&language={patientCorrespondenceLanguage}
```

Speichern Sie das Portal. Die Platzhalter in geschweiften Klammern füllt Axenita beim Aufruf aus; so weiss DocNote, für welchen Patienten es geöffnet wurde.

### Den FHIR-API-Client anlegen

Wechseln Sie zum Abschnitt **FHIR-API** und legen Sie einen neuen Client an, ebenfalls mit dem Namen `DocNote`, damit die Verbindung leicht zu erkennen ist. Axenita generiert eine **externe Client-ID** und ein **Client-Secret**. Kopieren Sie beides und senden Sie es per E-Mail an das DocNote-Team: Damit schliessen wir die Verbindung zwischen Ihrer Axenita-Umgebung und Ihrem DocNote-Konto ab.

### Berechtigungen vergeben

Wählen Sie den eben erstellten DocNote-Client aus und fügen Sie nacheinander diese drei Berechtigungen hinzu:

- `system/Composition.c`
- `system/Encounter.c`
- `system/Patient.c`

Achten Sie darauf, dass der DocNote-Client ausgewählt ist, bevor Sie sie hinzufügen, damit sie dem richtigen Client zugeordnet werden. Bei Fragen unterstützen Sie die Teams von Axenita und DocNote bei der Einrichtung.

## Teil 2: tägliche Nutzung

Sobald die Verbindung aktiviert und vom DocNote-Team bestätigt ist, kehren Sie zur Patientenakte zurück und arbeiten wie gewohnt.

1. **DocNote aus Axenita öffnen.** Klicken Sie auf «Externer Aufruf», das Symbol rechts neben dem Drucker, und wählen Sie DocNote. Die App öffnet sich automatisch. Prüfen Sie beim ersten Mal in den DocNote-Einstellungen, dass die Axenita-Verbindung als aktiv angezeigt wird.
2. **Aufnehmen oder diktieren und generieren** Sie Ihren Bericht genau wie sonst in DocNote.
3. **In die Patientenakte senden.** Klicken Sie auf die Teilen-Option und wählen Sie «An Patientenakte senden». Da DocNote aus der Patientenakte in Axenita geöffnet wurde, ist der Patient automatisch identifiziert. Bestätigen Sie, und der Bericht wird gesendet.
4. **In Axenita übernehmen.** Schliessen Sie DocNote, kehren Sie zur Patientenakte zurück und klicken Sie auf das Doppelpfeil-Symbol. Dort erscheint der von DocNote übermittelte Inhalt. Wählen Sie die passende Konsultation, klicken Sie auf «Hinzufügen» und validieren Sie.

Der Bericht ist nun Teil der Patientenakte. Er bleibt in Axenita bis zur endgültigen Validierung vollständig editierbar.

## Warum dieser Ansatz

Die Axenita-Integration basiert auf dem FHIR-Standard: Der Bericht wird als strukturiertes Dokument übermittelt statt als eingefügter Text, und die Patientenidentität reist mit. Für die Ärztin oder den Arzt ist das sichtbare Ergebnis noch einfacher: ein Klick, um DocNote zu öffnen, ein Klick zum Senden, und nichts muss neu getippt werden.
