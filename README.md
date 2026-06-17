# RailGhadi

## 🚂 Voice-First Telephony & Offline Train Booking Platform

Book train tickets with a phone call. No smartphone. No internet. No app. Just your voice.

---

## 📖 Table of Contents

- Vision & Problem Statement
- User Journey
- System Architecture
- Audio Pipeline
- State Machine
- Payment Flow
- End-to-End Data Flow
- Tech Stack
- Security
- Project Structure
- Scaling

---

## 🎯 Vision & Problem Statement

RailGhadi enables feature-phone users to book train tickets using a simple phone call.

---

## 💡 User Journey

```mermaid
journey
    title RailGhadi Booking Journey
    section Call
      Dial Toll Free Number: 5: User
      Speak Journey Details: 5: User
    section Booking
      Select Train: 5: User
      Confirm Booking: 5: User
    section Payment
      Enter UPI PIN: 4: User
      Payment Success: 5: User
    section Delivery
      Receive SMS Ticket: 5: User
```

---

## 🏗️ System Architecture

```mermaid
graph LR

A[Feature Phone] --> B[Telephony Gateway]
B --> C[Express WS Gateway]

C --> D[Gemini Live API]
D --> C

C --> E[Redis Session Store]
C --> F[IRCTC Service]
C --> G[UPI 123PAY]

G --> C
C --> H[SMS Service]
H --> A
```

---

## 🔊 Audio Pipeline

```mermaid
graph LR

A[Caller Voice]
--> B[Telephony Gateway]
--> C[Mu-law Decoder]
--> D[Audio Resampler]
--> E[Gemini Live API]

E
--> F[Audio Response]
--> G[Audio Encoder]
--> H[Telephony Gateway]
--> I[Feature Phone Speaker]
```

---

## 🔄 Conversational State Machine

```mermaid
stateDiagram-v2

[*] --> CollectingDetails

CollectingDetails --> FetchingTrains
FetchingTrains --> TrainSelection
TrainSelection --> Confirmation

Confirmation --> CollectingDetails : Edit
Confirmation --> Payment : Confirm

Payment --> SMSDispatch : Success
Payment --> Payment : Retry

SMSDispatch --> Completed
Completed --> [*]
```

---

## 💳 DTMF Payment Flow

```mermaid
sequenceDiagram

participant User
participant Gateway
participant Express
participant UPI

User->>Gateway: Enter PIN
Gateway->>Express: DTMF Digits
Express->>UPI: Payment Request
UPI-->>Express: Success
Express-->>Gateway: Confirm
Gateway-->>User: Payment Successful
```

---

## 📊 Complete Data Flow

```mermaid
graph TD

Call[Phone Call]
--> Gateway[Telephony Gateway]

Gateway
--> Stream[Media Stream]

Stream
--> Express[Express Server]

Express
--> Gemini[Gemini Live]

Gemini
--> Express

Express
--> IRCTC[IRCTC APIs]

Express
--> UPI[UPI 123PAY]

UPI
--> Express

Express
--> SMS[SMS Service]

SMS
--> Passenger[Passenger]
```

---

## 🛠️ Tech Stack

- Node.js + Express
- Gemini Live API
- Twilio / Plivo
- Redis
- PostgreSQL
- UPI 123PAY
- Docker
- Kubernetes

---

## 🔐 Security

- TLS secured WebSockets
- Isolated DTMF handling
- Redis session isolation
- No voice recording storage
- PCI compliant payment flow

---

## 📁 Project Structure

```text
railghadi/
├── src/
├── routes/
├── lib/
├── config/
├── db/
├── docker/
├── k8s/
├── tests/
└── README.md
```

---

## 📈 Scaling Architecture

```mermaid
graph TB

LB[Load Balancer]

LB --> N1[Node Instance 1]
LB --> N2[Node Instance 2]
LB --> N3[Node Instance 3]

N1 --> Redis[(Redis Cluster)]
N2 --> Redis
N3 --> Redis

N1 --> Gemini[Gemini Live]
N2 --> Gemini
N3 --> Gemini
```
