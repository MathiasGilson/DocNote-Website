---
title: "DocNote x Axenita : configurer la connexion et envoyer vos rapports dans le dossier patient (vidéo)"
translationKey: "axenita-integration-tutorial"
excerpt: "Configurez le portail web et le client FHIR-API dans Axenita, ouvrez DocNote depuis le dossier patient, générez un rapport et renvoyez-le dans Axenita. Tutoriel vidéo complet."
category: "guides"
tags: ["tutorial", "video", "ehr-integration", "axenita"]
author: "Dre Alice Gilson"
authorRole: "Médecin & Directrice générale"
authorImage: "/images/dre_alice_gilson.jpg"
authorUrl: "https://www.linkedin.com/in/alice-gilson-816390251/"
image: "../../../assets/blog/yt-axenita-integration-tutorial.jpg"
fullImage: true
date: "2026-08-31"
---

<div class="video-embed"><iframe src="https://www.youtube-nocookie.com/embed/wpQYYmleWZg" title="DocNote x Axenita : configurer la connexion et envoyer vos rapports dans le dossier patient (vidéo)" loading="lazy" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div>

Vous pouvez désormais utiliser DocNote directement depuis votre DPI Axenita. Vous ouvrez DocNote depuis le dossier patient, générez votre compte rendu et l'envoyez directement dans Axenita, sans copier-coller et sans modifier vos habitudes. Cette vidéo couvre la configuration initiale puis le flux quotidien. Les deux sont détaillés ci-dessous, avec les valeurs exactes à saisir.

## Partie 1 : configuration initiale dans Axenita

### Ajouter le portail web DocNote

Connectez-vous à Axenita, rendez-vous dans **Paramètres** puis **Base de données**. En bas de la page se trouve la rubrique **Portail web**. Ajoutez un nouveau portail, nommez-le `DocNote` et saisissez l'URL suivante. Aucun nom d'utilisateur n'est nécessaire.

```
https://docnote.care/app/record?patientId={patientId}&patientIdSystem={patientIdOid}&firstName={patientFirstname}&lastName={patientLastname}&sex={patientGender}&birthday={patientBirthdate|dd.MM.yyyy}&language={patientCorrespondenceLanguage}
```

Enregistrez le portail. Les paramètres entre accolades sont remplis par Axenita au lancement : c'est ainsi que DocNote sait pour quel patient il a été ouvert.

### Créer le client FHIR-API

Rendez-vous dans la rubrique **FHIR-API** et ajoutez un nouveau client, nommé lui aussi `DocNote` pour identifier facilement la connexion. Axenita génère un **identifiant client externe** et un **secret client**. Copiez ces deux informations et transmettez-les à l'équipe DocNote par e-mail : elles nous permettent de finaliser la connexion entre votre environnement Axenita et votre compte DocNote.

### Attribuer les autorisations

Sélectionnez le client DocNote que vous venez de créer, puis ajoutez successivement ces trois autorisations :

- `system/Composition.c`
- `system/Encounter.c`
- `system/Patient.c`

Veillez à bien sélectionner le client DocNote avant de les ajouter, afin qu'elles soient attribuées au bon client. En cas de difficulté, les équipes d'Axenita et de DocNote restent à disposition pour vous accompagner dans la configuration.

## Partie 2 : utilisation quotidienne

Une fois la connexion activée et confirmée par l'équipe DocNote, retournez dans le dossier du patient et reprenez votre fonctionnement habituel.

1. **Ouvrir DocNote depuis Axenita.** Cliquez sur « Appel externe », l'icône située à droite de l'imprimante, puis sélectionnez DocNote. L'application s'ouvre automatiquement. À la première utilisation, vérifiez dans les paramètres de DocNote que la connexion avec Axenita est bien activée.
2. **Enregistrer ou dicter, puis générer** votre rapport comme habituellement dans DocNote.
3. **L'envoyer dans le dossier patient.** Cliquez sur l'option de partage puis « Envoyer vers le dossier du patient ». Comme DocNote a été ouvert depuis le dossier du patient dans Axenita, le patient concerné est automatiquement identifié. Confirmez : le rapport est envoyé.
4. **L'intégrer dans Axenita.** Fermez DocNote, revenez dans le dossier du patient et cliquez sur l'icône en double flèche. Le contenu transmis depuis DocNote y apparaît. Sélectionnez la consultation correspondante, cliquez sur « Ajouter » puis validez.

Le rapport fait désormais partie du dossier du patient. Il reste entièrement modifiable dans Axenita jusqu'à sa validation définitive.

## Pourquoi cette approche

L'intégration Axenita repose sur le standard FHIR : le rapport est transmis comme un document structuré et non comme du texte collé, et l'identité du patient voyage avec lui. Pour le médecin, le résultat visible est plus simple encore : un clic pour ouvrir DocNote, un clic pour envoyer, et rien à ressaisir.
