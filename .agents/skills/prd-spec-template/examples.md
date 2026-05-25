# Example: Voting System PRD

This is a complete, validated example PRD following the strict template-spec.md structure.

```markdown
# 🗳️ Système de Vote Électronique Sécurisé - Product Requirements Document

*Generated for AI-driven SDD creation*
*Version: 1.0.0*
*Date: 2024-01-15*

---

## 1. Objectifs & Intentions Fondamentales (*Intentions & Core Values*)

* **Description succincte :** Créer un système de vote électronique sécurisé, transparent et résistants aux fraudes, qui permet aux citoyens de participer aux élections démocratiques de manière accessible, tout en garantissant l'intégrité du processus électoral et la confidentialité des votes.
* **Ce qu'il faut fournir à l'IA :** Le problème fondamental de confiance dans les systèmes de vote traditionnels (papier ou électroniques), la nécessité absolue d'anonymat du votant combinée à la traçabilité complète pour l'audit, et les contraintes non négociables de sécurité militaire, de disponibilité 99.99%, et de conformité aux réglementations électorales internationales.

---

## 2. Clauses de Spécification Univoques (*Unambiguous Clauses*)

* **Description succincte :** Le système est découpé en règles métier atomiques couvrant l'authentification des votants, la soumission des votes, la vérification des résultats, et la gestion des élections, avec chaque règle étant indépendante et testable individuellement.
* **Ce qu'il faut fournir à l'IA :**
  - `REQ-001`: Le système DOIT authentifier chaque votant éligible avec un token cryptographique unique généré par les autorités électorales et valide uniquement pour l'élection spécifiée
  - `REQ-002`: Le système DOIT accepter un seul vote par votant par élection, avec détection et rejet automatique des tentatives de double vote
  - `REQ-003`: Le système DOIT enregistrer chaque vote de manière immutable dans une blockchain privée avec preuve de temps (timestamp) certifié
  - `REQ-004`: Le système DOIT générer une preuve de vote (reçu) pour chaque votant sans révéler son choix de vote ou son identité
  - `REQ-005`: Le système DOIT permettre aux auditeurs autorisés de vérifier l'intégrité de tous les votes sans pouvoir identifier les votants individuels
  - `REQ-006`: Le système DOIT fournir des résultats préliminaires en temps réel avec une latence maximale de 5 secondes après chaque vote
  - `REQ-007`: Le système DOIT supporter la révocation des tokens de vote en cas de compromission avérée, sans affecter les votes déjà enregistrés
  - `REQ-008`: Le système DOIT implémenter un mécanisme de sauvegarde manuelle en cas de panne totale du système électronique

---

## 3. Critères de Succès & Cas Limites Critiques (*Challenging Prompts & Edge Cases*)

* **Description succincte :** Définition des critères de succès mesurables et des scénarios complexes qui testent la robustesse, la sécurité et la résilience du système dans des conditions extrêmes ou des situations ambiguës.
* **Ce qu'il faut fournir à l'IA :**
  - Le système doit maintenir l'intégrité des votes et continuer à fonctionner même si 40% des nœuds de la blockchain tombent en panne simultanément
  - Que fait le système si un votant commence le processus de vote, puis coupe sa connexion Internet pendant 10 minutes avant de se reconnecter ? (Le vote doit être annulé et le token marqué comme inutilisé)
  - Comment le système gère-t-il une attaque par déni de service distribué (DDoS) visant à submerger les serveurs pendant les 2 dernières heures d'une élection très médiatisée ? (Le système doit maintenir un taux d'acceptation des votes > 95%)
  - Que se passe-t-il si deux votes sont soumis simultanément pour le même votant via des appareils différents (race condition) ? (Seul le premier vote reçu doit être accepté)
  - Comment le système détecte-t-il et répond-il à une tentative de voter avec un token volé ? (Le token doit être invalidé pour tous, le votant légitime doit être notifié, et la tentative doit être enregistrée pour enquête)
  - Que fait le système si la date et l'heure de fin d'élection sont atteintes pendant le traitement d'un vote ? (Le vote doit être rejeté même s'il a été initié avant la deadline)
  - Comment le système garantit-il la confidentialité des votes si un administrateur système malveillant a accès à la base de données ? (Chiffrement de bout en bout avec clés distribuées entre plusieurs parties de confiance)

---

## 4. Matrice de Comportements Interdits (*Anti-Patterns & Bugs Spécifiés*)

* **Description succincte :** Liste exhaustive des comportements, architectures et pratiques strictement interdits qui pourraient compromettre la sécurité, l'intégrité ou la confidentialité du système de vote.
* **Ce qu'il faut fournir à l'IA :**
  - Le système ne doit JAMAIS stocker de tokens d'authentification ou de votes en clair dans quelque base de données ou fichier que ce soit
  - Le système ne doit JAMAIS permettre à un administrateur système, quel que soit son niveau de privilège, de voir le vote individuel d'un utilisateur spécifique
  - Le système ne doit JAMAIS bloquer le thread principal ou l'interface utilisateur pendant le traitement cryptographique d'un vote
  - Le système ne doit JAMAIS accepter un vote sans une preuve cryptographique valide de l'éligibilité du votant
  - Le système ne doit JAMAIS permettre la modification ou la suppression d'un vote une fois qu'il a été enregistré dans la blockchain
  - L'interface ne doit JAMAIS afficher d'informations, de logs ou de messages d'erreur qui pourraient permettre de déduire l'identité d'un votant ou son choix
  - Le système ne doit JAMAIS dépendre d'un seul point de défaillance (SPOF) pour son fonctionnement
  - Le système ne doit JAMAIS utiliser de générateurs de nombres aléatoires non cryptographiquement sûrs pour la génération des tokens

---

## 5. Exemples d'Entrées / Sorties (*Executable Specifications / Unit Tests*)

* **Description succincte :** Exemples concrets et exécutables qui illustrent le comportement attendu du système pour différentes situations, servant de tests unitaires pour la conception du SDD.
* **Ce qu'il faut fournir à l'IA :**
  ```
  Entrée: POST /api/auth/token avec { "voter_id": "CITIZEN-784512", "election_id": "ELEC-2024-001", "biometric_data": "valid_fingerprint_hash" }
  Sortie attendue: { "status": "success", "token": "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9...", "expires_in": 3600, "election_id": "ELEC-2024-001" }
  ```
  
  ```
  Entrée: POST /api/auth/token avec { "voter_id": "CITIZEN-999999", "election_id": "ELEC-2024-001", "biometric_data": "invalid_fingerprint_hash" }
  Sortie attendue: { "status": "error", "code": "AUTH_FAILED", "message": "Données biométriques invalides", "retry_allowed": true }
  ```
  
  ```
  Entrée: POST /api/vote avec { "token": "valid_token", "election_id": "ELEC-2024-001", "choice": "CANDIDATE-A" }
  Sortie attendue: { "status": "success", "vote_id": "VOTE-2024-001-784512-001", "timestamp": "2024-01-15T14:30:45.123Z", "proof": "0x7f3a1b..." }
  ```
  
  ```
  Entrée: POST /api/vote avec { "token": "valid_token", "election_id": "ELEC-2024-001", "choice": "CANDIDATE-A" } (deuxième tentative avec le même token)
  Sortie attendue: { "status": "error", "code": "DUPLICATE_VOTE", "message": "Token déjà utilisé pour voter dans cette élection" }
  ```
  
  ```
  Entrée: GET /api/election/ELEC-2024-001/results?auditor_id=AUDIT-001&audit_key=valid_key
  Sortie attendue: {
    "election_id": "ELEC-2024-001", 
    "status": "completed",
    "total_votes": 1523456,
    "results": {
      "CANDIDATE-A": { "count": 789234, "percentage": 51.8 }, 
      "CANDIDATE-B": { "count": 523456, "percentage": 34.3 },
      "CANDIDATE-C": { "count": 210768, "percentage": 13.9 }
    },
    "turnout": 67.5,
    "blockchain_hash": "0x9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08"
  }
  ```
  
  ```
  Entrée: POST /api/vote avec { "token": "expired_token", "election_id": "ELEC-2024-001", "choice": "CANDIDATE-A" }
  Sortie attendue: { "status": "error", "code": "TOKEN_EXPIRED", "message": "Token expiré. Veuillez obtenir un nouveau token." }
  ```
  
  ```
  Entrée: GET /api/election/ELEC-2024-001/status
  Sortie attendue: { "election_id": "ELEC-2024-001", "status": "in_progress", "start_time": "2024-01-15T08:00:00Z", "end_time": "2024-01-15T20:00:00Z", "current_votes": 756234 }
  ```

---

## 6. Interfaces avec le Monde Réel (*System Interfaces & Boundaries*)

* **Description succincte :** Cartographie complète des points de contact du système avec son écosystème, incluant tous les acteurs, systèmes externes et protocoles de communication.
* **Ce qu'il faut fournir à l'IA :**
  - **Acteurs:**
    - Votants citoyens (authentifiés via biométrie ou carte d'identité électronique)
    - Administrateurs électoraux (gestion des élections, configuration du système)
    - Auditeurs externes (vérification de l'intégrité des élections)
    - Autorités de certification (génération et révocation des tokens de vote)
    - Techniciens système (maintenance et support technique, sans accès aux données de vote)
  - **Systèmes tiers:**
    - Base de données PostgreSQL (v15+) avec module pgcrypto pour le chiffrement
    - Service d'authentification biométrique national (API REST)
    - Blockchain Hyperledger Fabric (v2.5+) avec smart contracts pour l'immutabilité des votes
    - Service de timestamping externe (RFC 3161) pour la certification des horodatages
    - Système de notification push (Firebase Cloud Messaging) pour les alertes en temps réel
    - Service de monitoring (Prometheus + Grafana) pour la surveillance du système
  - **Protocoles:**
    - REST API (JSON) pour toutes les communications clientes-serveur
    - gRPC (Protocol Buffers) pour la communication inter-nœuds de la blockchain
    - WebSocket pour les notifications en temps réel (résultats, alertes)
    - HTTPS/TLS 1.3 pour toutes les communications externes
    - IPsec pour les communications internes entre nœuds de la blockchain
    - OAuth 2.0 avec PKCE pour l'authentification des administrateurs

---

*Conforme au template template-spec.md - Validé pour la génération de SDD par IA*
```
