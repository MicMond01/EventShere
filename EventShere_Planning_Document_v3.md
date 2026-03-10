**EVENTSHERE**

Full-Stack Product Planning & Feature Specification Document

*Plan Smarter. Connect Better. Experience More.*

Version 1.0 \| March 2026

**CONFIDENTIAL - INTERNAL PLANNING USE ONLY**

Table of Contents

1\. Product Vision and Overview

2\. User Roles and Account Types

3\. Event Center and Venue Module

4\. 3D Venue Viewer and Layout Planner

5\. Event Planner and Organizer Module

6\. Seating Arrangement Algorithm

7\. Invitation and RSVP System

8\. Guest and Event Goer Module

9\. Social Rating and Reputation System

10\. Real-Time Event Operations

11\. Notifications and Communication System

12\. Search, Discovery and Recommendation

13\. Print, Export and Import System

14\. Admin and Platform Management

15\. Frontend and User Experience Design

16\. Backend Architecture

17\. Database Design

18\. Security and Compliance

19\. Integrations and Third-Party Services

20\. Mobile Application

21\. Performance and Scalability

22\. Testing and Quality Assurance

23\. DevOps and Deployment

24\. Analytics and Reporting

25\. Monetization and Business Model

26\. Additional Suggestions and Recommended Features

27\. Future Roadmap and Development Phases

1\. Product Vision and Overview

1.1 App Name and Brand Identity

-   App Name: EventShere

-   Tagline: Plan Smarter. Connect Better. Experience More.

-   Brand personality: modern, clean, professional, social, and
    trustworthy

-   Primary target market: Nigeria and the wider African continent

-   Secondary target market: global diaspora communities and
    international expansion

-   The name EventShere merges Event with Sphere, representing a
    complete world around your event

1.2 Core Problem Being Solved

-   Event planning in Africa is largely manual, fragmented, and
    stressful

-   Venue discovery happens through word of mouth with no standardized
    information

-   Seating arrangement is done on paper or basic spreadsheets with no
    intelligence

-   Guest communication is scattered across WhatsApp, email, and phone
    calls

-   There is no platform that connects venue owners, planners, and
    guests in one place

-   There is no social accountability layer that improves guest behavior
    over time

1.3 Core Value Proposition

-   One platform for everything: find a venue, design the layout, manage
    guests, send invitations

-   First 3D event layout planner built for the African market

-   Smart algorithmic seating that respects social hierarchies and guest
    reputation

-   Real-time event operations from check-in to live updates

-   A social layer that builds a guest reputation profile and rewards
    good event citizens

1.4 Platform Types

-   Web application (primary, full-featured, works on desktop and
    browser on any device)

-   Mobile application for iOS and Android

-   Tablet-optimized interface (especially for the 3D layout planner)

-   Admin dashboard (web-based, for internal EventShere team)

1.5 Primary User Personas

-   Persona 1: Event Centers and Venue Owners (list and manage their
    spaces)

-   Persona 2: Professional Event Planners (manage multiple events and
    clients)

-   Persona 3: Individual Self-Planners (renting a hall for a personal
    event such as a wedding or birthday)

-   Persona 4: Event Guests and Attendees (register, get seated, rate
    peers)

-   Persona 5: Vendors such as caterers, AV teams, decorators,
    photographers

-   Persona 6: Platform Administrators (internal EventShere operations
    team)

1.6 Core Product Pillars

-   Pillar 1 - Venue Marketplace: discover, compare, book, and review
    event spaces

-   Pillar 2 - 3D Layout Planner: design and visualize the entire event
    space interactively

-   Pillar 3 - Smart Guest Management: invitations, RSVPs, algorithmic
    seating, check-in

-   Pillar 4 - EventShere Social: anonymous peer rating and long-term
    reputation scoring

-   Pillar 5 - Real-Time Operations: live event day tools from check-in
    to announcements

2\. User Roles and Account Types

2.1 Event Center Account (Venue Owner or Manager)

-   Represents a business or individual who owns or manages an event
    space

-   Can list one or multiple venues under a single account

-   Has a dedicated venue management dashboard

-   Can receive booking requests, confirm bookings, and track payments

-   Can respond to reviews left by planners

-   Must complete KYC verification before listing goes live

2.2 Event Planner or Organizer Account

-   Represents a professional event planner or any individual organizing
    an event

-   Can browse venues and send booking requests

-   Has full access to the 3D layout planner

-   Can create events, manage guest lists, and send invitations

-   Can manage multiple events simultaneously

-   Subscription tier determines feature limits (see Monetization
    section)

2.3 Guest or Event Goer Account

-   Any person who registers to attend an event or receives a private
    invitation

-   Builds a social profile and reputation score over time through event
    attendance

-   Can view their assigned seat in a 3D interactive map

-   Can rate and be rated anonymously by fellow guests

-   Has a personal event attendance history

2.4 Vendor Account

-   Represents catering companies, AV and sound teams, decorators,
    photographers, and similar service providers

-   Can be tagged to a specific zone or space within the 3D event layout

-   Receives printable vendor setup instructions generated by the event
    planner

-   Optional: vendors can create a marketplace profile to be discovered
    by planners

2.5 Platform Administrator Account

-   Reserved for the internal EventShere operations and technical team

-   Has full data access across all users, events, and venues

-   Can moderate content, handle disputes, manage billing, and monitor
    system health

-   Can enable or disable features using feature flags

2.6 Account Registration and Onboarding

-   Event Center registration steps:

    -   Enter business name, contact information, and venue address

    -   Upload venue photos, videos, and 3D model if available

    -   Set pricing and availability calendar

    -   Submit KYC documents (government ID, business registration,
        proof of venue ownership or lease)

    -   Account reviewed and approved by admin before going live

-   Event Planner registration steps:

    -   Enter full name or business name and contact details

    -   Set professional profile and optional credentials

    -   Add a payment method for venue bookings

    -   Complete onboarding tour of the 3D planner

-   Guest registration steps:

    -   Create a profile with name, photo, and bio

    -   Select event interest tags (weddings, conferences, concerts,
        etc.)

    -   Optionally link social accounts (Google, Facebook)

    -   Review and accept the social rating participation agreement

2.7 Authentication and Access Control

-   Email and password authentication

-   OAuth sign-in with Google, Apple, and Facebook

-   Two-factor authentication (2FA) via SMS OTP or authenticator app

-   Role-based access control (RBAC) across the entire platform

-   Session management with access tokens and refresh tokens

-   Password reset and account recovery flows via email

-   Account suspension and permanent ban capabilities for administrators

-   Automatic logout after extended inactivity

3\. Event Center and Venue Module

3.1 Venue Listing Creation

3.1.1 Basic Information

-   Venue name

-   Short description (shown in search results, maximum 160 characters)

-   Full description (shown on the venue profile page)

-   Venue type: hall, conference center, outdoor garden, rooftop,
    banquet room, amphitheatre, warehouse, church hall, hotel ballroom,
    community center

-   Physical address with map pin (GPS coordinates auto-fetched from
    address)

-   Contact phone number, email address, and optional social media links

3.1.2 Capacity and Physical Dimensions

-   Maximum seated capacity

-   Maximum standing or cocktail capacity

-   Room dimensions: length, width, and ceiling height (in metres and
    feet)

-   Number of separate rooms or sections within the venue

-   Stage dimensions if applicable

-   Entrance dimensions (important for large equipment delivery)

-   Parking capacity and type (on-site, street, valet available)

3.1.3 Facilities and Amenities Checklist

-   Air conditioning and heating

-   Generator and backup power supply

-   In-house sound system and PA system

-   Projector, LED screen, and AV setup

-   Stage and professional lighting rig

-   Dressing rooms and green rooms

-   Kitchen and catering preparation area

-   Bridal suite or VIP preparation room

-   VIP lounge

-   On-site parking

-   Security personnel and CCTV

-   Wheelchair accessibility and ramps

-   WiFi availability and estimated speed

-   Number of restrooms and their location

-   Outdoor space attached to the venue

-   Fire exits and safety equipment

3.1.4 Pricing Configuration

-   Hourly rate

-   Half-day rate (typically 4 to 6 hours)

-   Full-day rate

-   Weekend and public holiday premium pricing

-   Security deposit amount and refund policy

-   Additional charges: cleaning fee, setup fee, overtime rate per hour

-   Discount rules: weekday discount, off-season discount, returning
    client discount

-   Currency selection (Naira, US Dollar, British Pound, etc.)

3.1.5 Availability Calendar

-   Interactive calendar for the venue owner to mark available and
    blocked dates

-   Block-out dates for maintenance, private use, or holidays

-   Minimum booking notice period (for example, must be booked at least
    48 hours in advance)

-   Maximum advance booking period (for example, no bookings more than
    12 months ahead)

-   Real-time sync: when a booking is confirmed, the date is
    automatically blocked

-   iCal integration so venue owners can sync with their personal or
    business calendar

3.2 Venue Media Uploads

-   Minimum 5 high-resolution exterior photos required before listing
    goes live

-   Interior photos covering: the empty hall, stage area, seating
    arrangements, entrance, restrooms, kitchen, parking, and any unique
    features

-   360-degree panoramic photo upload for an immersive preview

-   Video walkthrough upload in MP4 format

-   Floor plan image upload in PNG or PDF format

-   3D model upload: supported formats include GLB, GLTF, OBJ, and FBX

-   All media reviewed by admin before listing is published

> *NOTE: Venue owners who do not have a 3D model can use the EventShere
> in-app 3D builder tool or request a professional scanning service
> through EventShere\'s partner network.*

3.3 Venue Profile Page (Public View)

-   Cover photo and full photo gallery carousel

-   Venue summary card showing capacity, location, price range, and star
    rating

-   Amenity icons and full amenities checklist

-   Interactive Google Maps embed with directions button

-   3D virtual tour viewer embedded in the profile

-   Availability checker widget (check a date and see if available)

-   Verified badge displayed on verified venue accounts

-   Reviews and star ratings section

-   Contact or Enquiry button

-   Book Now or Request a Quote button

-   Share venue profile on WhatsApp, Twitter, Instagram, and Facebook

> ***SUGGESTION: Add a Venue Comparison feature where a planner can
> select up to 3 venues side by side and compare their capacity,
> pricing, amenities, and ratings in a table view. This saves time and
> reduces back-and-forth browsing.***

3.4 Venue Booking Management Dashboard

-   Incoming booking requests list with status: pending, accepted,
    declined, counter-offered

-   Accept, decline, or counter-offer each booking request with an
    optional message

-   Confirmed bookings displayed in a calendar view

-   Full booking details: event type, planner name, number of guests,
    special requirements, dates

-   In-platform messaging thread between planner and venue owner

-   Invoice generation with automatic platform fee deduction

-   Payment tracking: amount received, pending, and withdrawn

-   Post-event reviews from planners visible in the dashboard

-   Revenue and booking analytics (monthly and yearly)

3.5 Venue Reviews and Ratings

-   Only planners who have completed an event at the venue can leave a
    review

-   Rating categories: cleanliness, accuracy of capacity claim, staff
    helpfulness, accuracy of amenities listed, and overall experience

-   Written review with optional photos attached

-   Venue owner can respond publicly to any review

-   Fake review detection using behavioral signals and IP analysis

-   Reviews are sorted by most recent and most helpful

4\. 3D Venue Viewer and Layout Planner

4.1 3D Engine and Technology

-   Primary 3D renderer: Three.js using WebGL, which runs natively in
    any modern browser with no plugin required

-   Alternative consideration: Babylon.js for more advanced physics and
    rendering requirements

-   Mobile AR view: WebXR API for augmented reality mode on phones and
    tablets

-   Supported 3D model formats for import: GLB, GLTF, OBJ, FBX

-   Fallback 2D floor plan view for devices that do not support WebGL

-   Progressive loading: large venue models load in stages so users see
    something immediately

-   LOD (Level of Detail) rendering: reduce polygon count for objects
    far from the camera to maintain performance

4.2 3D Viewer Features (Read-Only Mode for Guests and Preview)

-   Orbit controls: rotate the view, zoom in and out, and pan the camera

-   First-person walkthrough mode using keyboard arrow keys or on-screen
    controls

-   Top-down bird\'s-eye view toggle

-   Room measurement overlay showing dimensions of any selected surface

-   Lighting simulation: toggle between daytime, evening, candlelit, and
    night modes

-   Empty hall view versus fully arranged layout view

-   Fullscreen mode

-   Option to highlight specific zones (click a zone to see its label
    and details)

4.3 3D Layout Planner (Full Edit Mode for Planners)

4.3.1 Canvas and Environment

-   Load the venue\'s base 3D model as the scene environment

-   Grid overlay with magnetic snapping (snap objects to 0.5 metre grid
    intervals)

-   Ruler and tape-measure tool for precise distance measurement

-   Undo and redo stack supporting at least 50 steps

-   Auto-save to cloud every 30 seconds

-   Manual save button with save confirmation

-   Named layout versions: save a layout under a custom name such as
    Draft 1, Client Revision, or Final Approved Layout

-   Version history: view and restore any previously saved version

4.3.2 Furniture and Object Library

-   Tables: round table, rectangular table, banquet long table, cocktail
    tall table, head table

-   Chairs: banquet chair, throne chair, folding chair, cinema-style
    seat, conference chair, lounge sofa

-   Stage elements: raised platform section, podium, lectern, microphone
    stand, monitor speaker

-   AV and technology: projector, projector screen, LED video wall
    panel, DJ booth, speaker stack, lighting rig truss

-   Decorative objects: floral arch, entrance arch, backdrop frame,
    table centerpiece, candelabra, balloon cluster, photo frame display

-   Event zones: dance floor tile, red carpet section, buffet serving
    table, bar counter, photo booth enclosure

-   Infrastructure: entrance gate, registration or check-in desk,
    cloakroom counter, security barrier

-   Outdoor elements: tent section, gazebo frame, outdoor chair, garden
    table, lawn bench

-   Custom object upload: planners can upload their own 3D objects in
    GLB format

-   Object search bar at the top of the library panel

-   Filter objects by category

> ***SUGGESTION: Add an AI object suggestion feature where the planner
> types the event type and expected guest count, and the system
> recommends an initial object list and rough quantities. For example,
> for a 200-person wedding, it might suggest 25 round tables of 8 chairs
> each, a stage platform, head table, and 2 buffet serving tables.***

4.3.3 Drag and Drop Interaction

-   Drag any object from the library panel directly onto the 3D canvas

-   Click to select an object, which highlights it with a coloured
    bounding box

-   Transform gizmo with three handles: move, rotate, and scale

-   Hold Shift and click multiple objects to select them all
    simultaneously

-   Group selected objects into a single unit for easier movement

-   Alignment tools: align objects to the left, right, centre, top, or
    bottom of a selection

-   Even distribution tool: automatically space selected objects evenly
    horizontally or vertically

-   Duplicate an object using Ctrl+D keyboard shortcut

-   Delete selected object using the Delete key or the trash icon

-   Copy and paste objects with Ctrl+C and Ctrl+V

-   Lock an object\'s position to prevent accidental movement

-   Right-click context menu: options include Duplicate, Delete, Lock,
    Add Label, and Add Note

4.3.4 Zone Creation and Labeling

-   Draw custom zone boundaries on the floor using a polygon drawing
    tool

-   Available zone types:

    -   Seating Zone: general guest seating area managed by the
        algorithm

    -   High Table Zone: reserved for dignitaries, family, or VIP guests

    -   Stage Zone: performance or presentation area

    -   Dance Floor Zone: open area reserved for dancing

    -   Vendor Zone: space assigned to catering, decoration, bar, or
        other vendors

    -   Walkway and Aisle Zone: defined paths that guests use to
        navigate the venue

    -   Registration Zone: entrance area where guests check in

    -   Photography Zone: dedicated space for the photo or video team

    -   Custom Labeled Zone: any custom zone with a planner-defined name

-   Each zone can be given a unique name and colour

-   Zone name labels float above the zone in the 3D view

-   Zones are referenced by the seating algorithm to place guests in the
    correct areas

-   Zones can be locked to prevent accidental edits

-   Zone opacity can be adjusted so they do not visually overpower the
    furniture

4.3.5 Seat Tagging and Numbering System

-   Select any chair or set of chairs and assign a unique seat ID

-   Seat ID formats available:

    -   Numeric only: 1, 2, 3

    -   Alphanumeric: A1, A2, B1, B2

    -   Row and seat: Row 3 Seat 7

    -   Table and seat: Table 5 Seat 2

    -   Custom planner-defined format using a template string

-   Auto-numbering: select a row of chairs and the system assigns
    sequential IDs automatically

-   Seat categories:

    -   VIP or High Table seat

    -   Family reserved seat

    -   General guest seat

    -   Press or media seat

    -   Physically accessible seat placed near an aisle or entrance

-   Seat ID displayed as a floating label in the 3D view that can be
    toggled on or off

-   Seat map legend panel on the side showing colour coding by category

-   Export the full seat manifest as a CSV or Excel file

4.3.6 Layout View Modes

-   3D perspective view (the default editing view)

-   Top-down 2D floor plan view for precise measurements and printing

-   Zone highlight view showing coloured fill for each zone

-   Seat-only view that hides all decorative objects and shows only
    seats and their labels

-   Vendor map view that highlights vendor zones and suppresses all
    other objects

-   Guest preview view that simulates exactly what a guest will see in
    their seat-finding map

4.4 Layout Save, Import, and Export

-   Save the current layout to the planner\'s cloud account at any time

-   Maintain multiple named layout versions with automatic timestamps

-   Duplicate a layout to use as a starting point for a variation

-   Import a layout from a previously saved file

-   Export the layout as a JSON file in EventShere\'s native format for
    later re-import

-   Export the layout as a PDF with labelled zones and seat IDs for
    printing

-   Export the layout as a high-resolution PNG or SVG image for sharing

-   Export a specific zone\'s view as a standalone PDF for vendor
    instructions

-   Import community-shared templates from the EventShere template
    library

-   Share the layout via a read-only web link that anyone can open in a
    browser

4.5 Layout Template Library

-   Wedding reception with round table setup

-   Wedding reception with banquet and long table setup

-   Corporate conference theatre-style seating

-   Corporate conference classroom-style seating

-   Award ceremony and formal gala dinner

-   Birthday party

-   Outdoor garden event

-   Concert and live music show with standing crowd zones

-   Trade show and exhibition with booth zones

-   Cocktail and standing reception

-   Custom blank canvas for a completely fresh start

-   Community templates submitted by planners and reviewed by EventShere
    before publishing

-   Each template has a preview thumbnail, event type tag, and capacity
    range label

> ***SUGGESTION: Build a Template Rating system where planners rate
> templates they have used. The best-rated templates get featured in a
> curated Top Templates section, creating a community knowledge base.***

4.6 Print and Vendor Instructions Feature

-   Planner selects a specific zone or the entire floor plan

-   Adds text labels, setup notes, and directional arrows to the
    printout

-   Generates a named PDF document for a specific vendor, for example
    Caterer Setup Guide or DJ and Stage Setup

-   The PDF includes: zone name, zone dimensions, equipment list,
    arrival time, setup notes, and a rendered overhead screenshot of the
    zone

-   Planner can email the PDF directly to the vendor from within the
    platform

-   Planner can also download the PDF and share it through WhatsApp or
    any other channel

> *NOTE: This feature completely eliminates the need for planners to
> describe setups verbally or write separate instruction documents. The
> vendor receives a single clear visual document.*

5\. Event Planner and Organizer Module

5.1 Planner Dashboard

-   Overview summary cards showing: upcoming events, total confirmed
    guests, pending RSVPs, active layouts, and pending vendor tasks

-   Recent activity feed showing all platform actions related to the
    planner\'s events

-   Quick action buttons: Create New Event, Browse Venues, Open Layout
    Planner, Send Invitations

-   Full calendar view of all events past and upcoming

-   Notification centre with unread count badge

-   Shortcut to re-open the most recently edited layout

5.2 Event Creation Workflow

Step 1: Event Basics

-   Event name

-   Event type: wedding, conference, birthday party, product launch,
    concert, funeral reception, baby shower, graduation, award ceremony,
    religious gathering, or custom

-   Event start date and time, and end date and time

-   Public-facing event description

-   Event cover image and header banner upload

-   Event visibility setting: Public, Private, or Unlisted

-   Co-planner email invitations (invite team members to collaborate)

Step 2: Venue Selection

-   Search and filter venues from the EventShere marketplace

-   View venue profile, 3D tour, and check availability for the chosen
    date

-   Send a booking request to the venue with event details and
    requirements

-   Alternative: mark as an External Venue not on the platform

-   For external venues: upload a custom floor plan image as the base
    for the 3D planner

Step 3: 3D Layout Design

-   Open the 3D planner for the selected venue

-   Choose a layout template or start from a blank canvas

-   Design the full layout: place furniture, define zones, tag and
    number seats

-   Save the layout under a version name

-   Share the layout with co-planners for review or collaborative
    editing

Step 4: Guest Configuration

-   Set the maximum guest count based on venue capacity

-   Define guest categories and how many seats each category gets

-   Set the RSVP deadline date

-   Configure the registration form fields that guests must complete

-   Choose seating mode: automatic algorithm, manual assignment, or
    hybrid

-   Configure social score influence weight in the algorithm (off, low,
    medium, or high)

Step 5: Invitation Setup

-   Choose invitation type: Public Registration Form or Private Personal
    Invitation

-   Design the invitation card using the template gallery and
    customisation tools

-   Write the invitation message and set the RSVP deadline

-   Select delivery channels: email, SMS, WhatsApp, or in-app

Step 6: Event Publishing

-   Review the complete event summary before publishing

-   Publish the event or save as a draft

-   Share the event link on social media directly from the platform

-   Activate the invitation and registration campaign

5.3 Guest Management

-   Guest list view with columns for: full name, contact, category, RSVP
    status, seat assignment, and social score

-   Filter guests by category, RSVP status, or seating status

-   Add guests manually by entering name and email or phone number

-   Bulk import guests by uploading a CSV file with a field mapping
    wizard

-   Assign or re-assign seats manually at any time, overriding the
    algorithm

-   Tag guests as VIP, dignitary, family, general, press, or custom
    category

-   Add a private notes field for each guest visible only to the planner

-   View a guest\'s EventShere Social Score and tier at a glance

-   Manage check-in status on event day from the guest list

-   Remove a guest from the list with an optional notification to the
    guest

-   Manage a waitlist: when a confirmed guest cancels, the next person
    on the waitlist is offered the spot

5.4 Vendor Management

-   Add vendors to the event with name, service type, contact
    information, and assigned zone

-   View the vendor\'s assigned zone highlighted in the 3D layout

-   Generate and send a vendor setup PDF directly from the platform

-   Mark each vendor as confirmed, pending, or cancelled

-   Set a vendor arrival time separate from the guest arrival time

-   Add setup notes and equipment requirements per vendor

-   Optional: browse and hire vendors from the EventShere Vendor
    Marketplace

5.5 Event Timeline and Runsheet

-   Build a detailed order of events (runsheet) with time-stamped
    entries

-   Example entries: 14:00 Guests Begin Arriving, 14:30 MC Welcomes
    Guests, 15:00 Opening Prayer, 15:15 First Course Served

-   Assign responsibility for each runsheet item to a person or team

-   Share the runsheet with co-planners, venue staff, and MC

-   On event day: check off completed runsheet items in real time

-   Automatically notify the MC or relevant team member when their item
    is approaching

5.6 Team Collaboration

-   Invite co-planners by email address

-   Set permission levels: Viewer (can see everything but not edit),
    Editor (can edit layout and guest list), and Admin (full control)

-   Real-time collaborative editing of the 3D layout, similar to how
    Google Docs works

-   Activity log showing who changed what and at what time

-   Comment threads on specific layout elements to discuss changes in
    context

-   Resolve or dismiss comments

6\. Seating Arrangement Algorithm

6.1 Algorithm Overview

The EventShere seating algorithm is a constraint-based optimization
engine that automatically assigns guests to seats. It balances guest
categories, social relationships, reputation scores, accessibility
needs, and physical proximity rules. The planner remains in control and
can override any assignment at any time.

6.2 Input Data for the Algorithm

Guest Data

-   Full name and contact information

-   Guest category: VIP, dignitary, close family, general guest, press

-   Relationship to the host: for example, groom\'s family, bride\'s
    colleague, conference delegate

-   EventShere Social Score and tier

-   Accessibility requirements such as wheelchair user or hearing
    impairment

-   Dietary preferences for table planning purposes

-   Any flagged conflicts with other specific guests (marked by the
    planner)

Layout Data

-   All seat IDs and their assigned zones

-   Zone types and priority levels

-   Distance from the stage, main entrance, and emergency exits

-   Table capacity per table

-   Accessible seat locations

-   Aisle and walkway positions

Event Type Rules

-   Wedding: separate bride\'s family side and groom\'s family side,
    high table for immediate family, algorithm assigns general guests
    within their side

-   Conference: VIPs and special delegates in the front rows, press in
    designated rows, general delegates by registration order or score

-   Concert or show: no fixed seating unless pre-assigned, zones defined
    by ticket tier

-   Birthday party: close friends and family near the head table, other
    guests distributed evenly

6.3 Algorithm Rules Engine

Hard Constraints - These must never be violated

-   VIP and dignitary guests must be placed in the VIP or High Table
    zone

-   Guests with accessibility requirements must be placed at accessible
    seats

-   Guests flagged as conflicting with each other must not be placed at
    the same table

-   A guest cannot be assigned a seat in a zone that does not match
    their category

Soft Constraints - Optimized for where possible

-   Family members from the same side should sit at adjacent tables

-   Guests with higher Social Scores get preference for better seat
    positions within their category

-   Guests who have attended events together before may be grouped at
    the same table

-   Partially filled tables should be consolidated so guests are not
    isolated

Category Hierarchy for Seat Priority

-   Priority Level 1: The honoree or host (bride, groom, birthday
    person, keynote speaker)

-   Priority Level 2: Government officials, religious leaders, and
    titled dignitaries

-   Priority Level 3: Immediate family of the host

-   Priority Level 4: VIP friends and senior colleagues

-   Priority Level 5: General guests, sorted within this tier by Social
    Score

-   Priority Level 6: Press and media

-   Priority Level 7: Vendors and operational staff, not seated with
    guests

6.4 Algorithm Output

-   A complete seat assignment list: Guest Name mapped to Seat ID and
    Zone

-   A visualized seat map in the 3D planner where every seat shows the
    assigned guest\'s name

-   Exportable seat assignment list as CSV or Excel

-   Automated email to each guest with their seat details and 3D
    navigation map

-   Planner override panel: adjust any individual seat assignment after
    the algorithm runs

-   Re-run the algorithm at any time after adding new guests or
    modifying the layout

-   Conflict report: if the algorithm cannot satisfy all constraints, it
    shows which conflicts remain and why

6.5 How the Social Score Influences Seating

-   When the planner enables the social score influence setting:

    -   Within the same guest category, higher-scored guests receive
        preference for seats closer to the stage or head table

    -   Guests in Tier 5 (Flagged) are highlighted in the guest list for
        the planner to review before confirming their attendance

    -   Platinum and Gold tier guests may receive a small seating
        upgrade within their assigned category

-   The planner can set the influence level to off, low, medium, or high

-   The planner always retains final authority and can manually override
    the score\'s influence for any specific guest

> ***SUGGESTION: Add a Conflict Prediction feature that warns the
> planner before running the algorithm if two guests have been at the
> same previous event and one or both gave the other a very low rating.
> This helps the planner decide in advance whether to seat them far
> apart, saving time after the algorithm runs.***

7\. Invitation and RSVP System

7.1 Public Event Registration

-   The planner creates a public registration page for the event

-   Custom URL in the format: eventshere.com/events/event-name

-   The public page shows the event name, date, time, venue, cover
    image, and description

-   A prominent Register or RSVP button opens the registration form

-   Form fields the planner can enable or configure:

    -   Full name (required by default)

    -   Email address (required by default)

    -   Phone number

    -   Organization or company name

    -   Guest self-declared category: individual, family, press,
        delegate

    -   Dietary preferences

    -   Accessibility requirements

    -   Relationship to the host for weddings and similar events

    -   Number of additional guests or plus-ones if permitted

    -   Custom questions defined by the planner

-   On successful submission: a confirmation page is shown and a
    confirmation email is sent

-   Maximum registration cap based on venue capacity

-   Waitlist activates automatically when the cap is reached

7.2 Private Invitation System

-   The planner adds a guest by entering their name, email address, or
    phone number

-   The platform generates a unique personalized invitation link for
    each guest

-   The invitation contains:

    -   Event name, date, time, and venue with a map link

    -   A personalized greeting using the guest\'s name

    -   RSVP options: Confirm Attendance, Decline, or Tentative

    -   Option to add a plus-one if the planner permits it

    -   Field to specify any dietary or accessibility requirements

    -   The RSVP deadline date

-   Delivery channels: email, SMS, WhatsApp, or EventShere in-app
    notification

-   Automatic RSVP reminder messages sent 7 days, 3 days, and 1 day
    before the RSVP deadline

7.3 Invitation Card Designer

-   A gallery of 20 or more professionally designed invitation card
    templates

-   Template categories: wedding, corporate conference, birthday, formal
    gala, casual party, and religious event

-   Customisation options:

    -   Choose a colour scheme and font pairing

    -   Upload an event logo, a couple\'s photo, or a company logo

    -   Add or remove specific information fields

    -   Write a custom message body

    -   Choose a background pattern or upload a custom background image

-   Preview the invitation in both desktop and mobile view

-   Save the designed template for re-use in future events

-   Download the invitation as a PNG or PDF for physical printing or
    WhatsApp sharing

7.4 Seat Assignment Notification

-   After the seating algorithm runs and seats are assigned, the planner
    initiates the Send Seat Notifications action

-   Each guest receives a personalized message containing:

    -   Their confirmed seat ID, for example Table 7 Seat 3 or Centre
        Row D Seat 12

    -   An interactive 3D seat finder map showing the venue layout with
        their seat highlighted

    -   Step-by-step text navigation from the entrance to their seat

    -   A QR code for check-in on event day

    -   An overview of the event schedule

    -   The venue address with a button linking to Google Maps
        directions

-   Notifications are delivered via email, SMS, and in-app
    simultaneously

> ***SUGGESTION: Add a feature that lets guests reply directly to their
> seat notification to request a seat change or raise a concern. The
> planner receives this message in the guest management panel and can
> act on it. This creates a simple communication channel and reduces
> planner inbox clutter.***

7.5 RSVP Tracking Dashboard

-   Real-time RSVP status summary card showing: confirmed, declined,
    tentative, and no response counts

-   Filter the guest list by RSVP status and category

-   One-click resend invitation to all guests who have not responded

-   Export the current RSVP list as a CSV file

-   Automatic final guest count submitted to the seating algorithm when
    the RSVP deadline passes

-   RSVP conversion rate chart showing response rates over time after
    invitation was sent

8\. Guest and Event Goer Module

8.1 Guest Profile

-   Profile photo

-   Display name and short personal bio

-   Event attendance history (number of events attended, event types)

-   EventShere Social Score badge and tier label (Platinum, Gold,
    Standard, etc.)

-   Interest and event type tags

-   Privacy controls: the guest chooses what is visible to other guests
    on the platform

8.2 Event Discovery

-   Browse all public events available on the platform

-   Filter by: date range, event type, city or location, price (free or
    paid), and category

-   Search by event name or organizer name

-   Map view showing nearby events as pins

-   Personalized event recommendations based on past attendance and
    selected interest tags

-   Trending events section showing the most registered events in the
    user\'s city this week

8.3 Event Registration and RSVP

-   Click the Register or RSVP button on a public event page

-   Fill out the registration form and submit

-   Complete payment if the event requires a ticket

-   Receive an email confirmation with event details

-   Receive a seat assignment notification once the planner has run the
    algorithm

-   Add the event to the phone calendar via Google Calendar, Apple
    Calendar, or ICS file

8.4 My Events Dashboard

-   Upcoming events section with a live countdown to each event

-   Past events history

-   Pending RSVPs waiting for response

-   Declined events

-   Bookmarked or saved events for later

8.5 Guest 3D Seat Finder

-   Accessible from the seat assignment email link or from within the
    app

-   Shows a simplified 3D view of the venue floor plan

-   The guest\'s assigned seat is highlighted in a bright distinct
    colour

-   Navigation directions appear as a text step list: for example, Enter
    through the main door, walk straight ahead, your seat is in Row D
    highlighted in blue

-   The guest can rotate and zoom the 3D view

-   Toggle to a top-down 2D map view

-   A Get Directions to Venue button links to Google Maps or Apple Maps
    for navigation to the physical address

8.6 Event Day Check-In

-   The guest presents their QR code at the entrance on their phone
    screen

-   Venue staff or the planner scans the QR code using the EventShere
    app

-   The system confirms: guest name, seat ID, and check-in time

-   The planner\'s dashboard shows real-time check-in progress

-   Late arrivals are automatically flagged

-   Walk-in guests can be registered manually at the gate by the planner

9\. Social Rating and Reputation System

9.1 System Overview

The EventShere Social Rating System is an anonymous peer-driven
reputation engine. At every event, guests seated near each other can
rate one another across several behavioral and social categories. All
ratings are fully anonymous to encourage honest feedback. These ratings
accumulate over time into a personal EventShere Social Score, which
influences where the platform places a guest when they attend future
events. The system is designed to reward good social conduct and
encourage all guests to be respectful, punctual, and well-behaved.

9.2 When Rating Occurs

-   The rating window opens 2 hours after the event starts

-   The rating window closes 48 hours after the event officially ends

-   Guests can only rate other guests who attended the same event

-   To preserve meaningful context, a guest can only rate others seated
    within a defined radius of their own seat, such as the same table or
    adjacent tables

-   Guests are shown anonymized names on the rating screen, for example
    Guest at Table 5 or displayed by initials only

-   Rating is entirely optional and no guest is penalized for not rating
    anyone

9.3 Rating Categories

-   Conduct and Manners: was this guest respectful, orderly, and
    well-behaved throughout the event?

-   Social Presence: were they friendly, engaging, and pleasant to be
    around?

-   Punctuality: did they arrive on time and avoid disrupting the event?

-   Attire Appropriateness: did they dress suitably for the event type?

-   Overall Experience: a general impression of what it was like to be
    around this guest

-   Each category is rated on a 1 to 5 star scale

-   An optional anonymous text comment can be added to the overall
    rating

-   A quick one-tap rating option of thumbs up or thumbs down is also
    available for fast response

9.4 Rating Privacy Rules

-   The identity of the person giving a rating is never revealed to the
    person being rated

-   The person being rated cannot see individual rating entries, only
    their aggregate score

-   The platform stores raw rating data internally only for abuse
    detection and fraud prevention

-   A minimum of 3 separate raters is required before a score update is
    applied, preventing single-rater manipulation

-   Guests cannot rate someone they have a declared mutual connection
    with on the platform

9.5 EventShere Social Score Calculation

-   Score ranges from 0 to 1000

-   All new users start at 500 as a neutral baseline

-   Score input factors:

    -   Weighted average of ratings from all past events, with more
        recent events weighted more heavily

    -   Attendance consistency: guests who RSVP and actually attend
        receive a positive signal

    -   Event type diversity: attending different types of events
        indicates a well-rounded social presence

    -   Profile completeness bonus for users who have fully filled out
        their profile

    -   Score decay: if no events are attended within 6 months, the
        score slowly drifts back toward the neutral baseline of 500

-   Score tiers:

    -   Tier 1 Platinum Guest: 800 to 1000

    -   Tier 2 Gold Guest: 650 to 799

    -   Tier 3 Standard Guest: 450 to 649

    -   Tier 4 Low-Rated Guest: 200 to 449

    -   Tier 5 Flagged Guest: 0 to 199, platform review triggered

9.6 Score Visibility and Transparency

-   Guests can see their own score, tier, and a category-by-category
    breakdown on their profile

-   A score history graph shows how the score has changed over time

-   Guests cannot see another person\'s exact score

-   Event planners can see the social score and tier of guests in their
    guest management panel

-   Planners choose whether to consider the social score when running
    the seating algorithm

> ***SUGGESTION: Build a Social Score Appeal Process where a guest can
> dispute a specific event\'s impact on their score if they believe it
> was the result of coordinated abuse or a personal vendetta. The
> EventShere support team reviews the underlying anonymous data to make
> a fair determination.***

9.7 Abuse Prevention

-   Rate limiting: each guest may submit a maximum of 10 ratings per
    event

-   Anomaly detection: if a guest receives an abnormal cluster of very
    low ratings at one event, the system flags it for human review

-   Machine learning classifier on text comments to detect hate speech,
    personal attacks, harassment, or spam

-   Guests can report a specific rating as abusive without knowing who
    sent it

-   Platform administrators can manually nullify entire sets of ratings
    from a flagged event

-   Repeat abusive raters have their rating privilege suspended
    temporarily or permanently

9.8 How the Score Affects Future Seating

-   When the planner has enabled social score influence in the seating
    settings:

    -   Within any guest category, higher-scored guests are placed
        closer to the stage or main focus area

    -   Flagged Tier 5 guests appear with a warning flag in the
        planner\'s guest list

    -   Platinum and Gold guests may receive a subtle upgrade in seat
        position within their category

-   The planner always makes the final call and can override any
    score-based decision

10\. Real-Time Event Operations

10.1 Event Day Dashboard for the Planner

-   A live check-in counter showing how many guests have arrived versus
    how many are expected

-   A live seat map showing which seats are occupied, empty, or reserved
    for late arrivals

-   Vendor arrival tracker: mark each vendor as arrived, setting up, or
    fully ready

-   Real-time runsheet with items checked off as completed

-   A communication hub for messaging all guests, a specific category of
    guests, or a single individual

-   An incident log for recording any issues that arise during the event

-   Gate management panel showing the number of people who have passed
    through each entrance

10.2 Check-In System

-   QR code scanning using the device camera in the EventShere mobile
    app

-   The system works offline and syncs all check-ins when internet
    connectivity is restored

-   Manual search check-in by typing the guest\'s name or seat number

-   Walk-in registration at the gate for guests without a prior RSVP

-   Duplicate check-in prevention with a clear warning when a QR code is
    scanned more than once

-   VIP fast-track lane support with a separate check-in screen for VIP
    guests

-   Optional badge printing: generates a name badge PDF immediately on
    guest check-in

10.3 Live Seat Swap

-   If a conflict or practical problem arises on event day, the planner
    can swap two guests\' seat assignments in real time

-   Both guests receive an immediate updated notification with their new
    seat information

-   The 3D seat map in the dashboard updates instantly to reflect the
    change

10.4 Real-Time Guest Communication

-   Broadcast an announcement to all attendees via push notification and
    SMS

-   Send a message to a specific guest from the guest list

-   Send a reminder to all guests who have not yet arrived

-   Emergency alert feature: notify all confirmed guests instantly of
    any venue change, delay, or emergency

10.5 Post-Event Actions

-   Mark the event as concluded

-   Trigger the rating window to open for the social rating system

-   Send a post-event thank you message to all attendees

-   Request a venue review from the planner

-   Export the full attendance report as a CSV or PDF

-   Generate an event summary document showing guest count, check-in
    rate, vendor performance notes, and runsheet completion

-   Archive the event to the planner\'s history for future reference

11\. Notifications and Communication System

11.1 Notification Types

-   Booking confirmation (sent to planner when venue confirms the
    booking)

-   New RSVP received (planner notified when a guest responds)

-   Seat assignment sent (guest notified when their seat is assigned)

-   Event reminder sent 24 hours before and 2 hours before the event

-   Check-in confirmation for guests

-   Rating window open notification

-   Social score updated notification

-   Payment received or payment due notifications

-   New public event near your location

-   Private invitation received

-   RSVP deadline approaching for planners and guests

11.2 Delivery Channels

-   In-app push notifications via the web browser and mobile app

-   Email for all transactional and marketing communications

-   SMS reserved for critical notifications to manage costs

-   WhatsApp Business API for invitations and seat notifications

11.3 Email System

-   Transactional emails: registration confirmation, seat assignment,
    booking confirmed, payment receipt

-   Marketing emails: event recommendations and platform updates
    (separate from transactional, can be unsubscribed from individually)

-   Email template engine with support for planner branding: planner\'s
    logo and colours on outgoing emails

-   Email open rate and click-through rate tracking

-   Bounce management and automatic unsubscribe handling

-   Email delivery provider: SendGrid or Amazon SES

11.4 Notification Preferences

-   Users can turn on or off each notification type individually

-   Channel preferences: choose email, SMS, or push notification per
    notification type

-   Quiet hours setting: no notifications sent between a user-defined
    time window

-   Language preference for all notification content

12\. Search, Discovery, and Recommendation

12.1 Venue Search

-   Full-text search by venue name, area, or city

-   Filter by: guest capacity range, amenities checklist, price range,
    event type suitability, and distance

-   Sort results by: most popular, highest rated, nearest location,
    lowest price, and newest listings

-   Map-based search view with venue pins and pop-up cards

-   Saved search alerts: user is notified when a new venue matching
    their criteria is listed

12.2 Event Search for Guests

-   Search public events by name, event type, or keyword

-   Browse by event category with category icons

-   Location-based discovery using the device\'s GPS

-   Date range filter

-   Free versus paid event filter

-   Featured and promoted events section

12.3 Recommendation Engine

-   Venue recommendations for planners based on: past event types,
    preferred locations, typical budget, and historical booking patterns

-   Event recommendations for guests based on: declared interest tags,
    location, past event attendance, and similar users\' attendance
    patterns

-   Collaborative filtering: users with similar event histories see
    similar recommendations

-   Trending in your city: highlight events and venues gaining rapid
    engagement

> ***SUGGESTION: Build a Smart Event Brief feature where a planner types
> a brief description of their event needs into a search box, for
> example a 300-person outdoor wedding reception in Lagos in December
> for around 1.5 million Naira, and the recommendation engine returns a
> ranked shortlist of matching venues alongside suggested layout
> templates and estimated total costs. This would dramatically speed up
> the planning process for new planners.***

13\. Print, Export, and Import System

13.1 Printable Outputs

-   Full floor plan: top-down labelled layout with all zones and seat
    IDs visible

-   Vendor zone map: a specific zone extracted with setup notes and
    equipment list

-   Seat assignment table sorted by seat ID, table number, or guest name

-   Guest list with category and RSVP status

-   Event runsheet

-   QR code check-in sheet with all guest QR codes printed on a single
    page for staff use

-   Name badges formatted for standard Avery label sheets

-   High-resolution rendered 3D screenshot of the complete layout

13.2 Export Formats

-   PDF as the primary export format for all printable documents

-   PNG and SVG for digital sharing of layout images

-   CSV and Excel for data files such as guest lists and seat
    assignments

-   JSON as the native EventShere format for layout import and export

-   ICS calendar file for guests to add the event to their personal
    calendar

13.3 Import Capabilities

-   Import a guest list via CSV with a field mapping wizard

-   Import a floor plan image to use as a background reference layer in
    the 3D planner

-   Import a 3D venue model in GLB or GLTF format

-   Import a previously exported EventShere layout JSON file

-   Import a layout from the community template library

14\. Admin and Platform Management

14.1 Admin Dashboard

-   User management: view, search, edit, suspend, or permanently ban any
    account

-   Venue management: review and approve new venue listings, and remove
    non-compliant ones

-   Event moderation: view all public events, flag or remove
    inappropriate listings

-   Rating moderation: review flagged ratings and nullify abusive ones

-   Financial overview: total booking volume, platform revenue,
    commission collected, and pending payouts

-   Support ticket management with status tracking

-   System health monitoring dashboard

-   Feature flags management: enable or disable specific features
    without a code deployment

14.2 KYC and Identity Verification

-   Venue owners submit: government-issued ID, business registration
    certificate, and proof of venue ownership or lease

-   Administrators review each submission and approve or reject with a
    reason given

-   A Verified badge is awarded and displayed on the venue profile

-   Periodic re-verification required for high-value accounts

-   Integration with Smile ID for Nigerian and African identity
    verification

14.3 Dispute Management

-   Booking disputes between planners and venue owners

-   Guest complaints about seating assignments

-   Fraud reports on payments or fake listings

-   Refund processing workflow with admin approval steps

-   Escalation levels: automated resolution attempt, then support agent,
    then senior administrator

14.4 Content Moderation

-   All venue photos are reviewed by an administrator before the listing
    goes live

-   Event descriptions reviewed for policy compliance

-   AI-assisted text moderation for all user-generated reviews,
    comments, and rating text

-   A manual review queue for any content flagged by the AI system

15\. Frontend and User Experience Design

15.1 Design System

-   A unified brand design system defining colours, typography, spacing,
    grid, and icon set

-   Component library created in Figma and exported to the frontend
    codebase

-   Responsive layout: designed for mobile (360px and wider), tablet
    (768px and wider), and desktop (1280px and wider)

-   Accessibility compliance: WCAG 2.1 Level AA standard

-   Dark mode support

-   Internationalization framework built in from the start to support
    multiple languages

-   Support for right-to-left text layouts for Arabic and similar
    languages

15.2 Key Pages and Screens

-   Marketing landing page:

    -   Hero section with a live demo video of the 3D layout planner

    -   Feature highlights with icons

    -   How it works section with 3 simple steps

    -   Pricing comparison table

    -   Testimonials from planners and venue owners

    -   Clear call to action: Sign Up Free

-   Authentication pages: Sign Up with role selection, Login, Forgot
    Password, Email Verification

-   Venue search and discovery page

-   Individual venue profile page

-   Event discovery feed for guests

-   Event planner dashboard

-   3D layout planner in full-screen mode

-   Guest profile page

-   Admin dashboard

-   Invitation landing page that guests see when they click an
    invitation link

15.3 3D Planner Interface Design

-   Left panel: object library with categorized tabs and a search bar,
    with thumbnail previews

-   Right panel: properties inspector showing the selected object\'s
    dimensions, rotation angle, label, colour, and lock status

-   Top toolbar: undo, redo, save, zoom controls, view mode toggle,
    print, and export

-   Bottom toolbar: layer visibility toggles to show or hide zones, seat
    labels, grid, and measurements

-   Centre canvas: the full 3D scene with orbit, zoom, and pan controls

-   Mini-map: a small top-down thumbnail of the full layout in the lower
    corner for navigation

-   Floating tooltips appear when the cursor hovers over any object

-   Keyboard shortcuts: Ctrl+Z for undo, Ctrl+Y for redo, Delete to
    remove an object, Ctrl+D to duplicate, Ctrl+S to save

15.4 Mobile-Specific User Interface

-   Touch-friendly 3D controls: pinch to zoom, two-finger drag to
    rotate, single-finger swipe to pan

-   A simplified version of the 3D planner on mobile: view-only with
    limited editing for minor adjustments

-   AR mode: point the device camera at a physical space to overlay the
    3D layout on the real environment

-   Bottom tab navigation bar for the mobile app

-   Swipe gesture on RSVP cards: swipe right to confirm, swipe left to
    decline

-   Offline mode: event details, seat assignment, and venue map are
    cached for use without internet

16\. Backend Architecture

16.1 Architecture Pattern

-   Microservices architecture where each core function runs as an
    independent, separately deployable service

-   API Gateway as a single entry point that routes all frontend
    requests to the appropriate service

-   Event-driven architecture using a message queue for asynchronous
    tasks such as sending emails and recalculating scores

-   CQRS (Command Query Responsibility Segregation) pattern applied to
    performance-critical areas where reading and writing need separate
    optimization

16.2 Core Backend Services

-   Auth Service: user registration, login, JWT token issuance, OAuth,
    session management, and 2FA

-   User Service: profile management, preferences, and social score data

-   Venue Service: venue listings, media management, and availability
    calendar

-   Event Service: event creation, editing, publishing, and runsheet
    management

-   Booking Service: booking requests, confirmations, and payment
    integration

-   Layout Service: 3D layout data storage, version history, and import
    and export

-   Invitation Service: invitation generation, multi-channel delivery,
    and RSVP tracking

-   Seating Algorithm Service: constraint solver and seat assignment
    generation

-   Notification Service: multi-channel notification dispatch via email,
    SMS, push, and WhatsApp

-   Rating Service: rating collection, score calculation, and abuse
    detection

-   Search Service: Elasticsearch-powered venue and event search

-   Media Service: photo, video, and 3D model upload, storage,
    optimization, and CDN delivery

-   Payment Service: booking payments, refunds, and platform fee
    collection

-   Analytics Service: event tracking and reporting

16.3 Technology Stack (Revised)

*This stack has been revised to prioritise skills that are learnable,
testable, and widely supported. Every technology in this list is
industry-standard, has strong documentation, and can be built and run by
a small team or a solo developer. There are no over-engineered
enterprise tools here.*

Frontend

-   **React + Vite + TypeScript** - the industry-standard combination
    for building fast, component-driven web applications. Vite replaces
    Create React App and gives you a near-instant development server.
    TypeScript adds type safety that will save you countless hours of
    debugging as the codebase grows.

    -   State management: Zustand (simple, lightweight, no boilerplate
        compared to Redux)

    -   Styling: Tailwind CSS (utility-first, fast to write, consistent
        design without a separate CSS file per component)

    -   Routing: React Router v6

    -   HTTP client: Axios or the native Fetch API for all API calls to
        the backend

Backend

-   **Node.js + Express + TypeScript** - Express is deliberately
    minimal, which means you learn exactly what is happening at every
    layer of your API. TypeScript on the backend ensures that the same
    type definitions used on the frontend can be shared, reducing bugs
    at the boundary between the two. This replaces the previous NestJS
    recommendation, which added unnecessary complexity for an
    early-stage build.

    -   Architecture: a single monolithic Express app to start, with
        clearly separated route folders per domain (venues, events,
        guests, auth). Splitting into microservices is a Phase 3
        concern, not a Day 1 concern.

    -   Validation: Zod for request body and parameter validation (works
        seamlessly with TypeScript)

Primary Database

-   **PostgreSQL** - used for all structured relational data: users,
    venues, events, bookings, guests, seat assignments, ratings, and
    invitations. Start by writing raw SQL queries directly so you
    understand exactly what is happening in the database. Once the
    schema is stable, you can optionally introduce Prisma ORM to reduce
    repetitive query code.

    -   Start with raw SQL using the pg Node.js driver so you understand
        queries first

    -   Migrate to Prisma ORM once the schema is stable to speed up
        development (optional)

    -   Hosted on Railway, Supabase, or Render for easy managed
        PostgreSQL in early development

Layout Storage

-   **MongoDB** - used exclusively for storing 3D layout JSON documents.
    A layout file contains hundreds of nested objects (furniture
    positions, zone polygons, seat tags, rotation values, colours) that
    change shape as features are added. MongoDB's flexible document
    model is ideal for this use case. Everything else remains in
    PostgreSQL. Use MongoDB Atlas free tier to start.

    -   Use the Mongoose ODM for schema validation on layout documents

    -   Each layout version is stored as a separate document, making
        version history and rollback simple

Authentication

-   **JWT + bcrypt (built in-house)** - rather than outsourcing
    authentication to a third-party service like Auth0 or Firebase Auth,
    EventShere builds its own. This is a deliberate learning decision.
    Building JWT-based auth from scratch means the team deeply
    understands how sessions, tokens, and role checks actually work,
    which is essential knowledge for a platform that handles payments
    and private guest data.

    -   bcrypt for password hashing (minimum 12 salt rounds)

    -   jsonwebtoken library for issuing and verifying access tokens and
        refresh tokens

    -   Access token expiry: 15 minutes. Refresh token expiry: 7 days,
        stored in an HTTP-only cookie

    -   Role-based middleware: a single Express middleware function
        reads the JWT and checks the user role before each protected
        route

Real-Time Communication

-   **Socket.IO** - used for all real-time features: live check-in
    updates during an event, live seat map changes when a planner swaps
    seats, real-time RSVP counter updates, and collaborative layout
    editing. Socket.IO is paired with the Express server and requires no
    separate service to set up.

    -   Each event gets its own Socket.IO room so broadcasts only go to
        the right participants

    -   Socket connections are authenticated using the same JWT token
        used for REST API calls

File and Media Storage

-   **Cloudinary (free tier)** - handles all photo and video uploads for
    venue profiles and event covers. Cloudinary automatically resizes
    images, converts to the correct format, and serves files through a
    global CDN. The free tier provides 25GB of storage and 25GB of
    monthly bandwidth, which is more than sufficient for an early-stage
    product. This replaces the previous Amazon S3 recommendation, which
    requires more setup and AWS account management. Cloudinary is the
    simplest path from zero to production-ready media.

    -   Upload via the Cloudinary Node.js SDK from the Express backend
        (never directly from the browser)

    -   3D model files (GLB/GLTF) are stored in Cloudinary as raw files
        alongside images

    -   When scale demands it, migrate to Amazon S3 with minimal code
        change (swap one upload function)

3D Rendering

-   **Three.js** - the most widely used WebGL library in the world. It
    runs entirely in the browser with no installation required by the
    user, which is critical for a web-first product. The 3D layout
    planner, the guest seat finder, and the venue virtual tour all run
    on Three.js. React Three Fiber (R3F) wraps Three.js in a
    React-friendly component API, making it much easier to integrate
    with the React frontend.

    -   Use React Three Fiber (R3F) to integrate Three.js into the React
        component tree

    -   Use Drei (the R3F helper library) for orbit controls, object
        loading, environment maps, and HTML labels in 3D space

    -   GLTFLoader for loading venue 3D models and individual furniture
        objects

    -   Drag-and-drop in 3D space implemented using raycasting
        (detecting where on the 3D floor the user is pointing)

What Was Removed and Why

-   **NestJS removed** - NestJS is powerful but opinionated and adds a
    steep learning curve through decorators, modules, and dependency
    injection. Express gives full control and is easier to learn and
    debug at this stage.

-   **Redis removed (for now)** - Redis adds operational complexity that
    is not necessary in the early stages. Session management via
    HTTP-only cookies and JWT handles auth without Redis. Add Redis in
    Phase 2 when performance demands caching.

-   **RabbitMQ removed (for now)** - a message queue is not needed until
    you have thousands of concurrent operations. For now, async tasks
    like sending emails run via simple async functions or a lightweight
    job library such as Bull (which uses Redis under the hood). Add
    RabbitMQ in Phase 3.

-   **Elasticsearch removed (for now)** - PostgreSQL's native full-text
    search (tsvector and tsquery) is powerful enough to handle venue and
    event search for the first 10,000 listings without a separate search
    engine. Add Elasticsearch in Phase 3 if search performance becomes a
    bottleneck.

-   **Amazon S3 replaced with Cloudinary** - Cloudinary has a generous
    free tier, handles image resizing and CDN delivery automatically,
    and takes 30 minutes to integrate. S3 requires IAM policy
    configuration, bucket permissions, and a separate CDN setup.
    Cloudinary is the correct choice until you have a reason to need the
    raw control of S3.

-   **Python removed as a language** - the seating algorithm can be
    written in TypeScript/Node.js. There is no algorithmic reason to
    introduce a second backend language. Running Python as a separate
    microservice adds deployment complexity. Keep everything in
    TypeScript until there is a specific performance reason to separate
    it.

16.4 API Design

-   RESTful API for standard CRUD operations

-   GraphQL for flexible and nested data queries such as event feeds and
    venue discovery

-   WebSocket via Socket.IO for all real-time features

-   API versioning using URL path prefixes such as /api/v1/ and /api/v2/
    with backward compatibility

-   Rate limiting applied per user and per IP address

-   Full API documentation using OpenAPI and Swagger

17\. Database Design

17.1 Core Tables and Collections

-   users: id, email, password hash, role, status, created at, updated
    at

-   user_profiles: user id, display name, photo URL, bio, preferences
    JSON, social score

-   venues: id, owner id, name, description, type, address, capacity,
    amenities JSON, status

-   venue_media: venue id, media type (photo, video, 3D model), URL,
    sort order

-   venue_availability: venue id, date, is blocked, booking id

-   events: id, planner id, venue id, name, type, start time, end time,
    visibility, status

-   event_layouts: event id, layout JSON, version number, name, created
    at, is active

-   guests: id, event id, user id (nullable for non-registered guests),
    name, email, phone, category, RSVP status, seat id

-   seats: id, layout id, seat label, zone, category, x coordinate, y
    coordinate, z coordinate

-   seat_assignments: guest id, seat id, event id, assigned by
    (algorithm or manual), timestamp

-   invitations: id, event id, guest id, unique token, status, sent at,
    responded at

-   bookings: id, venue id, event id, planner id, status, total amount,
    payment status

-   ratings: id, rater user id, ratee user id, event id, conduct score,
    social score, punctuality score, attire score, overall score,
    anonymous comment

-   social_scores: user id, current score, tier, last calculated at,
    score history JSON

-   notifications: id, user id, type, channel, payload JSON, delivery
    status, created at

-   vendors: id, event id, vendor name, service type, contact info,
    assigned zone id, confirmation status

17.2 Data Relationships

-   A venue has many events booked against it

-   An event has one active layout with full version history

-   An event has many guests, each with at most one seat assignment

-   A rating belongs to both a rater and a ratee and is linked to a
    specific event

-   A social score aggregates ratings from all events for a single user

-   A booking links an event to a venue

17.3 Data Integrity and Reliability

-   Foreign key constraints enforced at the database level

-   Optimistic locking for concurrent layout edits to prevent
    conflicting updates

-   Soft deletes on all records: rows are marked as deleted rather than
    physically removed, preserving the audit trail

-   Financial transaction records are immutable and cannot be edited

-   Database schema migrations managed with a versioned migration tool

18\. Security and Compliance

18.1 Authentication Security

-   Passwords are hashed using bcrypt with a minimum of 12 rounds

-   JWT tokens with short access token expiry (15 minutes) and longer
    refresh token expiry (7 days)

-   Refresh token rotation: a new refresh token is issued on every use

-   All active sessions are revoked when a user changes their password

-   Account lockout after 5 consecutive failed login attempts

-   Two-factor authentication via TOTP (e.g., Google Authenticator) or
    SMS OTP

18.2 Data Security

-   All data encrypted in transit using HTTPS and TLS 1.3

-   Sensitive personal data encrypted at rest, including email
    addresses, phone numbers, and identification documents

-   All database connections use SSL

-   Cloud storage buckets are private by default with access granted
    only through time-limited signed URLs

-   All secrets and API keys managed through a secrets management
    service, never hardcoded

18.3 API Security

-   Input validation and sanitization on every API endpoint

-   SQL injection prevention through parameterized queries and ORM usage

-   XSS prevention through Content Security Policy headers

-   CSRF protection on all state-changing requests

-   Rate limiting applied per user, per IP, and per individual endpoint

-   CORS policy configured to allow only trusted origins

-   OWASP Top 10 vulnerability checklist reviewed during all security
    audits

18.4 Privacy and Compliance

-   NDPR (Nigeria Data Protection Regulation) compliance for Nigerian
    users

-   GDPR compliance for European Union users

-   Clear and accessible privacy policy and terms of service

-   Cookie consent banner on first visit

-   Right to erasure: users can delete their account and all associated
    personal data

-   Data portability: users can download all their data in a
    machine-readable format

-   Complete audit logs for all administrator actions

-   The anonymity of rating data is guaranteed: the rater\'s identity is
    never stored in a form that can be linked to their rating

19\. Integrations and Third-Party Services

19.1 Payment Gateways

-   Paystack: primary payment processor for Nigeria and Africa

-   Flutterwave: West Africa and broader African coverage

-   Stripe: international payments for global expansion

-   Payment flows: venue booking payment, event ticket purchase, and
    subscription billing

-   Refund processing available through each gateway

-   Escrow model: planner\'s payment is held in escrow until the event
    date passes, then released to the venue

-   Platform commission is automatically deducted from the payout amount

19.2 Communication Services

-   Email delivery: SendGrid or Amazon Simple Email Service (SES)

-   SMS: Termii for Nigeria, Twilio for international

-   WhatsApp: WhatsApp Business Cloud API from Meta

-   Mobile push notifications: Firebase Cloud Messaging (FCM) for
    Android and iOS

19.3 Mapping and Location

-   Google Maps API for venue location pins, interactive maps, and
    driving directions

-   Geocoding service to convert written addresses to GPS coordinates
    automatically

-   Alternative: Mapbox for a more cost-effective solution at higher
    usage volumes

19.4 Identity Verification

-   Smile ID for KYC verification of Nigerian and African venue owners

-   Document OCR to extract data from government-issued identity
    documents automatically

19.5 Media Processing

-   AWS Lambda with FFmpeg for video processing and thumbnail generation

-   Cloudinary or imgix for image optimization, resizing, and CDN
    delivery

-   3D model validation service to verify that uploaded GLB and GLTF
    files are structurally valid

19.6 Calendar Integrations

-   Google Calendar API for adding events directly to a guest\'s Google
    Calendar

-   ICS file generation for Apple Calendar and any standard calendar
    application

-   Microsoft Outlook integration via the Outlook REST API

19.7 Analytics and Monitoring

-   Mixpanel or Amplitude for product analytics, user behavior tracking,
    and funnel analysis

-   Sentry for error tracking and crash reporting

-   Datadog or New Relic for infrastructure monitoring and application
    performance management

-   Hotjar for session recording and heatmaps during the UX research
    phase

20\. Mobile Application

20.1 Technology Choice

-   Framework: React Native for a single codebase that compiles to both
    iOS and Android

-   State management: Zustand or Redux Toolkit

-   Navigation: React Navigation library

-   3D rendering on mobile: Three.js via Expo GL or a React Native
    WebView with Three.js loaded inside it

-   AR functionality: Expo Camera with ARKit (iOS) and ARCore (Android)
    for the seat finder AR mode

20.2 Mobile-Specific Features

-   QR code scanner for event check-in at the entrance

-   Camera access for AR seat finder mode and venue photo uploads

-   Push notification receiver via Firebase Cloud Messaging

-   Offline mode: event data, seat assignment, and venue map are cached
    locally

-   Background synchronization: automatically updates cached data when
    connectivity is restored

-   Biometric authentication: fingerprint or Face ID login option

-   Haptic feedback on key interactions such as confirming an RSVP or
    completing check-in

-   Deep linking: a link in an invitation email opens the correct screen
    directly in the app

20.3 App Store Requirements

-   iOS: App Store Connect account, TestFlight for beta distribution

-   Android: Google Play Console, internal and closed testing tracks

-   App store screenshots, feature graphics, and descriptions in
    multiple languages

-   iOS Privacy Nutrition Label filled out accurately

-   Android Play Store Data Safety section completed

21\. Performance and Scalability

21.1 Performance Targets

-   Page load time: under 2.5 seconds on a 4G mobile connection

-   3D planner initial load: under 5 seconds for a standard venue model

-   API response time at the 95th percentile: under 300 milliseconds for
    standard queries

-   WebSocket latency for real-time check-in updates: under 100
    milliseconds

-   Seating algorithm execution time: under 30 seconds for up to 1,000
    guests

-   Email delivery time: under 5 minutes for all transactional emails

21.2 Caching Strategy

-   Redis cache for user sessions, frequently accessed venue profiles,
    and search results

-   CDN caching for all static assets including JavaScript, CSS, images,
    and 3D model files

-   HTTP cache headers to leverage browser-level caching for static
    assets

-   Database query result caching for expensive operations such as venue
    search and score calculations

-   Stale-while-revalidate strategy for event discovery feeds so users
    always see something immediately

21.3 Scalability Design

-   All services are designed for horizontal scaling by running multiple
    replicas behind a load balancer

-   Load balancing via AWS Application Load Balancer or Nginx

-   Database read replicas to separate read-heavy operations from write
    operations

-   Queue-based async processing: emails, notifications, and score
    updates all run through background queue workers

-   3D model streaming: large venue models are streamed in chunks rather
    than loaded all at once

-   All user-uploaded images are automatically compressed and resized
    before storage

-   Database connection pooling using PgBouncer for PostgreSQL

22\. Testing and Quality Assurance

22.1 Testing Levels

Unit Tests

-   All business logic functions tested in isolation

-   Seating algorithm tested with seed data to verify that seat
    assignments match expected rules for each event type

-   Social score calculation tested with controlled inputs to verify the
    formula

Integration Tests

-   Every API endpoint tested with valid inputs, invalid inputs, and
    edge cases

-   Database layer tested for CRUD correctness, constraint enforcement,
    and transaction rollbacks

-   Payment flow tested in each gateway\'s sandbox environment covering
    success, failure, and refund scenarios

End-to-End Tests

-   Full venue owner journey: create account, submit KYC, list venue,
    receive and accept a booking

-   Full planner journey: create event, design layout, invite guests,
    run algorithm, check in guests

-   Full guest journey: receive invitation, RSVP, view 3D seat finder,
    check in at the event, rate peers

Performance Tests

-   Load testing: simulate 10,000 concurrent users using k6 or Artillery

-   Seating algorithm stress test: 5,000 guests in a single run

-   3D planner tested with complex venue models of 50 megabytes or
    larger

Security Tests

-   Penetration testing conducted quarterly by an external security team

-   OWASP ZAP automated scans on all API endpoints before each release

-   Dependency vulnerability scanning using Snyk or npm audit in the CI
    pipeline

22.2 QA Process

-   All feature branches must pass automated tests before merging

-   Pull requests require at least one reviewer\'s approval

-   A staging environment mirrors production and every release is tested
    there before going live

-   User acceptance testing (UAT) with a group of beta testers for all
    major features

-   Bug tracking managed in Jira or Linear

-   Regression testing run before every major platform release

23\. DevOps and Deployment

23.1 Infrastructure

-   Primary cloud provider: Amazon Web Services (AWS)

-   Container orchestration: Kubernetes via Amazon EKS

-   Each microservice runs in its own Docker container

-   Infrastructure as Code: all infrastructure defined and provisioned
    using Terraform

-   Three environments: Development, Staging, and Production

23.2 CI/CD Pipeline

-   Version control and CI/CD orchestration via GitHub or GitLab

-   CI pipeline steps: install dependencies, run linter, run unit tests,
    run integration tests, build Docker image, push image to container
    registry

-   CD to staging: automatic deployment triggered on every merge to the
    develop branch

-   CD to production: triggered by a manual approval step from a senior
    engineer

-   Blue/green deployment strategy to achieve zero-downtime releases

-   One-click rollback to the previous stable version

23.3 Monitoring and Alerting

-   Uptime monitoring with Pingdom or Better Uptime

-   Application performance monitoring with Datadog APM or New Relic

-   Error tracking with Sentry, configured to send alerts to a dedicated
    Slack channel

-   Centralized log aggregation using the ELK Stack (Elasticsearch,
    Logstash, Kibana) or AWS CloudWatch

-   Database monitoring with slow query log analysis and connection pool
    metrics

-   On-call alerting with PagerDuty or Opsgenie for critical production
    incidents

23.4 Backup and Disaster Recovery

-   Automated daily database backups with 30-day retention policy

-   Point-in-time recovery (PITR) enabled for PostgreSQL

-   S3 media file replication to a second AWS region

-   Recovery Time Objective (RTO): 4 hours maximum

-   Recovery Point Objective (RPO): 1 hour maximum

-   Disaster recovery runbook documented, reviewed, and tested quarterly

24\. Analytics and Reporting

24.1 Planner Analytics

-   Event performance summary: total registrations, attendance rate, and
    check-in rate

-   Guest demographic breakdown by category and location

-   RSVP funnel visualization: invited to viewed to responded to
    confirmed to attended

-   Seating occupancy rate per zone

-   Average event size and trend over time

24.2 Venue Analytics

-   Booking volume and revenue over time with monthly and annual views

-   Peak demand days and seasonal patterns

-   Profile view to booking conversion rate

-   Average booking value per event type

-   Review score trend and breakdown by category

24.3 Platform Analytics for Administrators

-   Total registered users by role with growth trend

-   Total events created and completed

-   Venue listing count and growth

-   Total booking volume and platform commission revenue

-   Seating algorithm performance: average execution time and manual
    override rate

-   Social rating system health: average scores, flagged content rate,
    and abuse reports

-   Notification delivery rates: email open rate, SMS delivery rate,
    push notification open rate

-   3D planner feature usage: which tools and objects are used most
    frequently

24.4 Business Intelligence

-   Data warehouse using Google BigQuery or Amazon Redshift for
    historical analysis

-   Business intelligence dashboard using Metabase or Looker for the
    operations team

-   Automated weekly and monthly summary reports emailed to the admin
    team

25\. Monetization and Business Model

25.1 Revenue Streams

-   Booking commission: EventShere collects a percentage fee on every
    venue booking made through the platform. Recommended starting range
    is 8 to 12 percent of the total booking value.

-   Event Planner subscription plans:

    -   Free Plan: 1 active event, basic 3D planner access, up to 50
        guests

    -   Pro Plan: unlimited events, full 3D planner, up to 500 guests,
        branded invitation emails, priority support

    -   Business Plan: unlimited guests, team collaboration, advanced
        analytics, API access, white-label options

-   Venue listing subscription plans:

    -   Free Tier: 1 listing, basic profile, limited photos

    -   Standard Plan: full listing features, availability calendar,
        analytics dashboard

    -   Premium Plan: featured placement in search results, promoted in
        the event discovery feed, dedicated account manager

-   Event ticketing fees: when a planner charges guests to attend,
    EventShere collects a small per-ticket platform fee

-   Vendor Marketplace listings (future): vendors pay a monthly fee to
    be discoverable by planners on the platform

25.2 Pricing Philosophy

-   The Free plan must provide genuine value to drive initial adoption
    among planners and venue owners

-   Upgrade prompts appear at natural friction points, such as when an
    event exceeds the 50-guest limit

-   Annual billing option with a 2-month discount equivalent

-   Discounted plans for verified non-profit organizations and
    educational institutions

-   A referral programme where planners earn subscription credits for
    referring new venue owners or other planners

26\. Additional Suggestions and Recommended Features

The following features are original recommendations beyond the initial
brief. These are designed to significantly increase the platform\'s
value, user stickiness, and competitive advantage in the market.

26.1 AI-Powered Event Planning Assistant

-   Build a conversational AI assistant embedded in the planner
    dashboard

-   The planner can type prompts such as: Plan me a 150-person birthday
    party at a venue near Victoria Island Lagos in March for a budget of
    800,000 Naira

-   The assistant suggests matching venues, a recommended layout
    template, an approximate guest count breakdown, and an estimated
    cost summary

-   The assistant can also answer questions like: How many round tables
    of 8 do I need for 200 guests?

-   This dramatically reduces the planning time for new and occasional
    planners

> ***SUGGESTION: This feature can be powered by a large language model
> API and a structured knowledge base of venue data, pricing averages,
> and layout templates. It becomes EventShere\'s biggest differentiator
> over any basic booking platform.***

26.2 EventShere Vendor Marketplace

-   A dedicated marketplace where vendors (caterers, photographers, DJs,
    decorators, AV teams) create profiles and list their services

-   Planners can discover vendors directly from the layout planner by
    clicking on a vendor zone and browsing available vendors nearby

-   Vendor profiles show: service type, portfolio photos, pricing range,
    location, reviews, and availability calendar

-   Planners can send a booking request to a vendor and manage the
    vendor within the same event dashboard

-   Vendors receive rating and review from planners after each event,
    building their own reputation score

> ***SUGGESTION: This creates an entirely new user category and revenue
> stream. Over time it becomes the go-to marketplace for event vendors
> in Nigeria and Africa, similar to how Fiverr works but specifically
> for live events.***

26.3 Event Budget Tracker

-   A built-in budget planner integrated into each event

-   Planner sets a total event budget at the start

-   All costs are logged: venue booking, vendor deposits, invitation
    printing, catering quote, decoration estimate

-   A real-time progress bar shows how much of the budget has been spent
    versus how much is remaining

-   The system flags when a category is over budget

-   A downloadable expense report can be generated at any time

> ***SUGGESTION: Budget overruns are one of the biggest pain points in
> event planning. A built-in tracker that talks directly to the booking
> system (venue booking cost auto-populates into the budget) makes this
> seamless and highly useful.***

26.4 Vendor and Staff QR Check-In

-   Separate from the guest QR check-in, vendors and staff receive their
    own unique QR codes

-   The QR code is linked to their assigned vendor zone and arrival time

-   Scanning their QR at the venue entrance confirms their arrival,
    updates the vendor tracker in the planner dashboard, and logs the
    exact time

-   The planner is alerted if a critical vendor has not arrived within
    30 minutes of their scheduled time

> ***SUGGESTION: This solves a very common event day problem: planners
> spending time on the phone chasing vendors. Real-time vendor arrival
> tracking gives planners early warning of potential issues.***

26.5 Live Guest Experience Feed

-   A private in-app social feed visible only to confirmed attendees of
    a specific event

-   Before the event: the planner can post countdown updates, dress code
    reminders, parking instructions, and schedule teasers

-   During the event: guests can post photos and reactions to a shared
    feed

-   After the event: a memory wall is created from all shared photos,
    viewable by attendees for 30 days

-   The planner controls whether the feed is open or read-only at each
    stage

-   This feed is private to the event and not part of the general
    EventShere social platform

> ***SUGGESTION: This feature increases engagement and gives guests a
> sense of community around the event before it even starts. It also
> generates organic content and memories that attendees associate with
> the EventShere brand.***

26.6 EventShere for Recurring Events

-   A feature specifically for event series such as weekly conferences,
    monthly networking dinners, or annual galas

-   The planner creates a recurring event template with shared settings:
    venue, layout, registration form

-   Each occurrence is a new event instance that inherits the template
    but can be individually adjusted

-   Guest data and social scores are carried across occurrences so
    regular attendees build history

-   Attendance streak tracking: guests who attend every occurrence of a
    series earn a loyalty badge

> ***SUGGESTION: Recurring events are common in corporate and religious
> settings. Providing a native recurring event feature saves planners
> significant setup time and creates strong user retention.***

26.7 Accessibility and Inclusive Design Tools

-   In the 3D planner, add a dedicated Accessibility Audit tool that
    scans the layout and flags potential issues:

    -   Seats not near an aisle for wheelchair users

    -   Stage areas without a ramp or level access

    -   Registration desk positioned too far from the entrance

    -   Restrooms not labeled or positioned accessibly

-   Generate an accessibility report the planner can share with the
    venue owner

-   Guests can flag accessibility needs during RSVP and the algorithm
    prioritizes accessible seats automatically

> ***SUGGESTION: Accessibility is increasingly important at professional
> events. Being the first event platform in Africa with built-in
> accessibility auditing tools is a meaningful differentiator and opens
> the platform to a wider user base.***

26.8 Photorealistic 3D Rendering for Client Presentations

-   Allow planners on the Business tier to request a photorealistic
    rendered image of their layout

-   The layout is submitted to an on-demand rendering service that
    produces a high-quality image within minutes

-   The rendered image is ready to share with a client in a presentation
    or proposal document

-   Add a Proposal Generator: automatically compile the event layout,
    venue details, guest count, and budget summary into a beautifully
    formatted PDF proposal document

> ***SUGGESTION: Professional planners frequently need to present
> concepts to clients before committing. A render-quality visual and
> auto-generated proposal document saves hours of manual work in tools
> like Canva or PowerPoint.***

26.9 Offline-First Event Day Mode

-   The entire event day workflow (check-in, seat lookup, runsheet)
    should work without any internet connection

-   Before the event, all guest data, seat assignments, QR codes, and
    the venue map are synced to the planner\'s device

-   All check-ins are queued locally and synced to the server the moment
    connectivity is restored

-   A clear offline indicator is shown in the app so the planner always
    knows their connectivity status

> ***SUGGESTION: Many venues in Nigeria and Africa have unreliable
> internet. Building a robust offline-first event day mode is not
> optional, it is essential for the platform to work reliably in the
> real operating environment.***

26.10 Smart Venue Scan Partnership Program

-   Partner with local scanning and photography firms to offer an add-on
    venue scanning service

-   Venue owners who want a professional 3D model can request a scan
    through EventShere

-   A partner team visits the venue, performs a 3D scan using a LiDAR
    scanner or photogrammetry, and delivers the processed GLB model

-   The model is uploaded directly to the venue\'s EventShere profile

-   EventShere takes a referral fee and the scanning partner handles the
    service delivery

> ***SUGGESTION: This removes the single biggest barrier to adoption
> among venue owners: most do not have a 3D model of their space. The
> partnership program solves this problem while creating an additional
> service revenue stream.***

26.11 Post-Event Analytics for Venue Owners

-   After a booking, give venue owners a detailed analytics report on
    how the event used their space

-   Data includes: which zones were occupied, average check-in time,
    vendor arrival times, and how the layout was configured

-   Over multiple events, venue owners can see patterns: which layout
    configurations are most popular, which amenities are most requested,
    and how capacity utilization compares across event types

> ***SUGGESTION: This data helps venue owners improve their offering and
> proves the value of being listed on EventShere. It also encourages
> venue owners to remain active on the platform and maintain accurate
> listings.***

26.12 EventShere API for Developers

-   Offer a public REST API allowing third-party developers to build on
    top of EventShere

-   API capabilities: create events, manage guests, check availability,
    trigger notifications

-   Developer documentation portal with code examples in Python,
    JavaScript, and PHP

-   API key management dashboard

-   Webhook support: developers can subscribe to events such as RSVP
    received, booking confirmed, and guest checked in

> ***SUGGESTION: Opening the platform to developers creates a developer
> community, generates integration partnerships with CRM and ticketing
> platforms, and significantly expands the reach of the EventShere
> ecosystem without EventShere having to build every integration
> directly.***

27\. Future Roadmap and Development Phases

Phase 1: Minimum Viable Product (Months 1 to 6)

-   Venue listing and marketplace with search and filter

-   Basic 3D viewer (view-only, no editing)

-   Event creation and basic management

-   Manual guest list management with manual seat assignment

-   Email invitation system

-   Public guest registration form

-   QR code check-in system

-   Basic planner and venue owner dashboards

-   Admin panel for user and venue moderation

-   Paystack payment integration for venue bookings

Phase 2: Core Product Completion (Months 7 to 12)

-   Full 3D drag-and-drop layout planner with all object categories

-   Zone creation and seat tagging system

-   Seating algorithm: basic category-based placement

-   Social rating system launch: rating collection and initial score
    display

-   Invitation card designer with template gallery

-   3D seat finder for guests

-   WhatsApp and SMS invitation delivery

-   Venue availability calendar with real-time booking sync

-   Mobile app for iOS and Android (beta release)

-   Layout save, import, and export system

Phase 3: Growth and Intelligence (Months 13 to 18)

-   Social score integration into the seating algorithm

-   AR seat finder mode on mobile

-   Vendor marketplace launch

-   Real-time collaborative layout editing for teams

-   Community template library for layouts

-   Advanced analytics dashboard for planners and venue owners

-   Event ticketing and payment for paid events

-   Budget tracker feature

-   Multi-language support: Yoruba, Igbo, Hausa, Pidgin English, and
    French

Phase 4: Scale and Innovation (Months 19 to 24)

-   AI-powered event planning assistant chatbot

-   Photorealistic rendering for client proposals

-   Smart venue scan partnership program launch

-   Public developer API with webhooks

-   Recurring events feature

-   Accessibility audit tool in the 3D planner

-   Expansion to other African markets: Ghana, Kenya, South Africa, and
    Cameroon

-   Enterprise plan for large corporate clients and government event
    departments

-   Live streaming integration for hybrid events

-   EventShere for Conferences: a dedicated product tier with abstract
    submission, speaker management, and breakout room scheduling

**End of EventShere Product Planning Document**

*Confidential - All rights reserved - EventShere 2026*
