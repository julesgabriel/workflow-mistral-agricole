# 📑 Template de PRD pour Génération de SDD par l'IA

## 1. Objectifs & Intentions Fondamentales (*Intentions & Core Values*)

* **Description succincte :** Définissez ici la vision globale et ce que le système *doit* accomplir pour l'utilisateur, mais aussi les principes directeurs (les "valeurs" du produit). Grove rappelle que 80 à 90 % de la valeur réside dans la communication de ces intentions.
* **Ce qu'il faut fournir à l'IA :** Le problème utilisateur à résoudre, le "pourquoi" derrière le produit, et les contraintes non négociables (ex: rapidité absolue, simplicité, haute sécurité).

## 2. Clauses de Spécification Univoques (*Unambiguous Clauses*)

* **Description succincte :** Divisez votre produit en règles métier ou clauses atomiques, chacune identifiée par un identifiant unique (ex: `REQ-001`, `REQ-002`). Moins le langage est ambigu, moins l'IA fera d'hypothèses erronées lors de la conception du SDD.
* **Ce qu'il faut fournir à l'IA :** Une liste à puces de règles claires et de comportements attendus du système, sans jargon flou qui pourrait embrouiller l'interposeur (linter/IA).

## 3. Critères de Succès & Cas Limites Critiques (*Challenging Prompts & Edges Cases*)

* **Description succincte :** Inspirée directement de la structure du *Model Spec* (où chaque clause pointe vers un fichier de prompts de test difficiles), cette partie définit précisément ce que le système doit faire face à des situations complexes ou des entrées contradictoires.
* **Ce qu'il faut fournir à l'IA :** Des scénarios "pièges" ou des cas limites (ex: "Que fait le système si l'utilisateur coupe sa connexion au milieu d'un vote ?"). Cela permet à l'IA de concevoir une architecture logicielle robuste (gestion des erreurs, résilience) dans le SDD.

## 4. Matrice de Comportements Interdits (*Anti-Patterns & Bugs Spécifiés*)

* **Description succincte :** À l'image de la section « *Don't be sycophantic* » mentionnée dans la vidéo pour corriger les dérives de GPT-4o, vous devez explicitement lister les comportements que le système **ne doit absolument pas adopter**.
* **Ce qu'il faut fournir à l'IA :** Une liste des effets secondaires indésirables, des failles d'expérience utilisateur à éviter ou des choix architecturaux proscrits (ex: "Le système ne doit jamais stocker de secrets en clair", "L'interface ne doit pas bloquer le thread principal pendant un traitement").

## 5. Exemples d'Entrées / Sorties (*Executable Specifications / Unit Tests*)

* **Description succincte :** Sean Grove compare les précédents juridiques à des paires d'entrées/sorties servant de tests unitaires pour la Constitution. Donnez à l'IA des exemples concrets pour ancrer ses représentations.
* **Ce qu'il faut fournir à l'IA :** Des exemples concrets de données d'entrée attendues et le résultat technique ou fonctionnel exact que le système doit renvoyer. C'est le meilleur moyen de rendre votre spécification "exécutable" par le modèle.

## 6. Interfaces avec le Monde Réel (*System Interfaces & Boundaries*)

* **Description succincte :** Définition des points de contact du système. Une bonne spécification doit cartographier comment elle s'intègre dans l'écosystème existant.
* **Ce qu'il faut fournir à l'IA :** Les acteurs (utilisateurs, administrateurs), les systèmes tiers avec lesquels communiquer (APIs, bases de données existantes) et les protocoles cibles (gRPC, REST, etc.) si vous avez des exigences particulières.

---

### 💡 Conseil pour l'utilisation avec l'IA :

Rédigez ce document au format **Markdown**. Comme le souligne la vidéo, le Markdown est le format idéal car il est lisible par les humains, facilement versionnable (Git), et nativement compris avec une excellente précision par les LLM pour générer l'étape suivante : le **SDD**.