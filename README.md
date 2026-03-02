# 1724project
## Motivation
Many small and medium-sized student organizations such as campus clubs rely on Google Forms, spreadsheets or emails to manage event registration. When identity verification, event payment processing, or ticket validation are required, significant manual effort is typically involved. Organizers need to verify tickets, track approvals and distribute tickets separately. As a result, the process of recording and organizing event registration and participation data becomes time-consuming and prone to human error. Additionally, real-time attendance tracking and fraud prevention are rarely supported in this process.

We aim to build a platform that provides a lightweight event and ticketing management system for small and medium-sized events that supports event publishing, identity verification, ticket generation, and ticket validation. This project is worth pursuing because event and ticket management remains inefficient and error-prone for many small or mid-sized student organizations. While there are large commercial platforms(such as Eventbrite), it is relatively complex to use them and the service fees are not low for small events. Therefore, a simple, efficient and fully featured event and ticketing management platform that reduces manual workload is in demand. 

The primary target users includes:
- Student event organizers (e.g., school clubs) who want to publish events, verify participants’ identity, and manage ticketing
- Attendees who need to register events, and access digital tickets

By integrating event publishing and management, ticket generation and validation into a single platform, this project demonstrates a practical and worthwhile solution that optimizes event workflows, reduces manual errors, and enhances the overall efficiency of small-scale event management. 

## Objective and Key Features


## Tentative Plan
Our project timeline is approximately four weeks from March 1 to 28. The specific assignment of team members (A and B) will be finalized during Phase 1 after further discussion and detailed planning. We mainly divide the development process into four phases based on the following task allocation:

Phase 1: System Design & Project Setup (week 1- March 1 to 7)
During the first phase, we will:
- Build system architecture(A)
- Setup development environment(A)
- Configure Express.js backend skeleton and basic routing (A)
- Design database schema and relationships(B)
- Create PostgreSQL database (B)
- Design basic UI structure for both organizer and customer mode (A&B)
- Define REST API endpoints(A&B)

Phase 2: Core Feature Development (week 2 - March 8 to 14)
In the second phase, we will implement the core features for both frontend and backend:
- Authentication
  - User registration and login feature (A)
  - Role selection (organizer or customer) (A)
  - Public event browsing homepage (B)
- Organizer Event Management
  - Organizer Home page (A)
  - Event Creation form (B)
  - Edit/delete event (B)
  - Ticket sales monitoring dashboard (A)
- Customer Ticket Purchase and Management
  - Event detail page (A)
  - Ticket purchase flow (including uploading student verification) (A)
  - Ticket tracking (B)
  - Ticket download page with QR display (B)
- Integration
  - Connect frontend pages with backend APIs (A&B)

Phase 3: Integration, Testing & Presentation Preparation (week 3 - March 15 to 21)
During the third phase, the team focuses on system integration and improvement. Both team members will collaborate on the final testing and presentation preparation. There are the following tasks:
- Full system integration and bug fixing (A&B)
- Perform end-to-end testing for all user flows (A&B)
- Prepare demo script (A&B)
- Draft presentation slides (A&B)

Phase 4: Additional Feature Development & Finalization (week 4 - March 22 to 28)
In this final phase, the team will implement additional features and conduct final testing. At least two additional features will be guaranteed to be completed, while the remaining features will be implemented if time permits. At the same time, the final deliverables will be prepared collaboratively by the team members. The following additional features work division will be:
- Additional Feature
  - Real-Time Updates (WebSocket) (A)
  - Email Notification for new events (A)
  - Document Upload & Validation (B)
  - Automated database backup and recovery (B)
- Final testing and bug fixes (A&B)
- Prepare final report and documentation (A&B)
- Record demo video (A&B)

## Initial Independent Reasoning (Before Using AI)
Our initial decision is to use separate frontend and backend, with React for frontend, and Express for backend with REST APIs. In this way, the frontend and backend are independent which makes the code easier to understand and maintain. The UI logic will not mix with authentication rules or database updates, making the code development clear and safe. Additionally, this allows a better independent development. For a team project, separating frontend and backend makes parallel work easier.

For the database, we expect to have the following relational entities stored in PostgreSQL: Users, Events, Registrations, Tickets, Student Verification. The database will be processed in the backend to ensure consistency and the frontend will primarily fetch and display data through REST APIs. The client-side state will be limited to UI interactions such as form inputs. 

We will focus on building a complete workflow instead of adding many features in the beginning. Our core features include: role-based authentication (Organizer or Attendee), event creation and management, QR-based ticket generation and validation, student ID upload and verification. For additional features, we select:... We will not implement real payment processing, considering the complexity of it within the limited timeline. Our aim is to build a smaller but well-integrated system instead of a larger but incomplete platform. 

Before start, we expect the following challenges: 
· We need to design a clean role-based authentication since organizers and attendees have different interfaces and permissions. We need to prevent unauthorized actions. 
· Building system architecture and designing a feasible database schema could be challenging because it is the basement of the whole project. We need to think clearly about how to coordinate frontend and backend development.
· Secure QR validation may be a challenge because we may need to cope with multiple requests simultaneously. The backend logic needed to be carefully designed to ensure safety. 

For work division, we decided to divide responsibilities by features rather than strictly separating frontend and backend work. We will divide the main features (e.g., authentication, ticket generation, student validation) to each team member since this would reduce fragmentation and improve consistency. Before feature implementation, we plan to jointly design the database schema, project architecture and  APIs to ensure misunderstanding and inconsistency in the later phase. 

## AI Assistance Disclosure
We did not use AI at all in part 4 and 5. We mainly use AI tools on grammar checking in part 1, 2 and 3. For example, in the motivation part, we asked AI if there are any grammar mistakes or phrases that need improvement. AI suggested that we can change “event posting and managing” to “event publishing and management”. We discussed whether the change would affect the clarity of the sentence. We decided to adopt the AI’s suggestion because it sounds more formal.
